import express from "express";
import Bug from "../models/bug.model";
import { getPagingObject, parsePaging } from "../utils/paging";
import { Prisma } from "@prisma/client";
import { selectUserSimplified } from "../lib/query/user";
import { Image as IT } from "../types/profile";
import { UserSimplified } from "../types/user";
import { simplifyUserWF } from "../utils/user/user.normalize";
import { ApiResponse } from "../utils/response";
import {
  ExpressRequestCloudinary,
  ExpressRequestExtended,
} from "../types/request";
import Image from "../models/image.models";

const selectBug = {
  createdAt: true,
  description: true,
  id: true,
  images: { select: { src: true, id: true } },
  isResolved: true,
  updatedAt: true,
  user: { select: selectUserSimplified },
} satisfies Prisma.BugSelect;

type SelectBugPayload = Prisma.BugGetPayload<{ select: typeof selectBug }>;

type B = {
  id: number;
  description: string;
  images: IT[];
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  reporter: UserSimplified;
};

const normalizeBug = async (payload: SelectBugPayload): Promise<B> => {
  return Promise.resolve({
    createdAt: payload.createdAt,
    description: payload.description,
    id: payload.id,
    images: payload.images,
    isResolved: payload.isResolved,
    reporter: await simplifyUserWF(payload.user),
    updatedAt: payload.updatedAt,
  });
};

export const getAllBugs = async (
  req: express.Request,
  res: express.Response
) => {
  const { limit, offset } = parsePaging(req);

  const bugs = await Bug.findMany({
    take: limit,
    skip: offset,
    orderBy: [{ createdAt: "desc" }, { isResolved: "asc" }],
    select: selectBug,
  });

  const data = await Promise.all(
    bugs.map((bug) => Promise.resolve(normalizeBug(bug)))
  );

  const total = await Bug.count();

  return res
    .status(200)
    .json(await getPagingObject({ data, total_records: total, req }));
};

export const deleteBug = async (
  req: express.Request,
  res: express.Response
) => {
  const { bugId } = req.params;
  const bId = Number(bugId);
  await Bug.delete({ where: { id: bId } });

  return res.status(204).json(new ApiResponse(null, 204));
};

export const updateBug = async (
  req: express.Request,
  res: express.Response
) => {
  const { isResolved, description } = req.body;

  const { bugId } = req.params;
  const bId = Number(bugId);

  await Bug.update({
    where: { id: bId },
    data: {
      isResolved,
      description,
    },
  });

  return res.status(204).json(new ApiResponse(null, 204));
};

export const reportBug = async (
  req: express.Request,
  res: express.Response
) => {
  const { description } = req.body;
  const { userId, uploadedImageUrls } = req as ExpressRequestExtended &
    ExpressRequestCloudinary;

  const uId = Number(userId);

  const bug = await Bug.create({
    data: { description, userId: uId },
    select: selectBug,
  });

  if (bug && uploadedImageUrls && (uploadedImageUrls ?? []).length > 0) {
    await Image.createMany({
      data: (uploadedImageUrls as string[]).map((src) => ({
        bugId: bug.id,
        src,
      })),
    });
  }

  const normalizedBugRes = await normalizeBug(bug);

  return res.status(201).json(new ApiResponse(normalizedBugRes, 201));
};
