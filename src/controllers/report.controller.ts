import express from "express";
import {
  ExpressRequestCloudinary,
  ExpressRequestExtended,
} from "../types/request";
import Report from "../models/report.model";
import { ApiResponse } from "../utils/response";
import Image from "../models/image.models";
import { getPagingObject, parsePaging } from "../utils/paging";
import { Prisma } from "@prisma/client";
import { selectUserSimplified } from "../lib/query/user";
import { selectChatRoomSimplified } from "../lib/query/chat";
import { Image as ImageT } from "../types/profile";
import { ChatRoomSimplified, ChatSimplified } from "../types/chat";
import { CommentSimplified } from "../types/comment";
import { Post } from "../types/post";
import { UserSimplified } from "../types/user";
import { simplifyUser } from "../utils/user/user.normalize";
import { normalizeChatRoomSimplified } from "../utils/chat/chatRoom.normalize";
import { normalizePost } from "../utils/post/post.normalize";
import { selectPost } from "../lib/query/post";

const selectReport = {
  id: true,
  comment: {
    select: {
      postId: true,
      comment: true,
      id: true,
      image: true,
      user: { select: selectUserSimplified },
      createdAt: true,
      updatedAt: true,
      _count: { select: { likes: true } },
    },
  },
  group: { select: selectChatRoomSimplified },
  message: {
    select: {
      chatRoom: { select: { isGroupChat: true } },
      chatRoomId: true,
      author: { select: selectUserSimplified },
      id: true,
      message: true,
      createdAt: true,
      updatedAt: true,
      chatImage: { select: { id: true, src: true } },
    },
  },
  images: { select: { id: true, src: true } },
  reportedUser: { select: selectUserSimplified },
  post: {
    select: selectPost,
  },
  reporter: { select: selectUserSimplified },
  createdAt: true,
  updatedAt: true,
  report: true,
  type: true,
} satisfies Prisma.ReportSelect;

type SelectReportPayload = Prisma.ReportGetPayload<{
  select: typeof selectReport;
}>;

type ReportBase = {
  id: number;
  images: ImageT[];
  report: string;
  createdAt: Date;
  updatedAt: Date;
};

type ReportGroup = {
  type: "group";
  group: ChatRoomSimplified;
};

type ReportComment = {
  type: "comment";
  comment: CommentSimplified;
};

type ReportPost = {
  type: "post";
  post: Post;
};

type ReportMessage = {
  type: "message";
  message: ChatSimplified;
};

type ReportUser = {
  type: "user";
  user: UserSimplified;
};

type ReportT = ReportBase &
  (ReportComment | ReportPost | ReportGroup | ReportMessage | ReportUser);

const normalizeReport = async (
  payload: SelectReportPayload
): Promise<ReportT> => {
  const base = {
    createdAt: payload.createdAt,
    images: payload.images,
    id: payload.id,
    report: payload.report,
    updatedAt: payload.updatedAt,
    type: payload.type,
  } as any;

  switch (base.type) {
    case "user": {
      base.user = await simplifyUser(payload.reportedUser as any);
      break;
    }
    case "comment": {
      const p = payload.comment!;
      base.comment = {
        comment: p?.comment,
        id: p?.id,
        createdAt: p?.createdAt,
        image: p?.image,
        updatedAt: p?.updatedAt,
        user: p?.user,
        postId: p?.postId,
        totalLikes: p?._count.likes,
      };
      break;
    }
    case "group": {
      base.group = await normalizeChatRoomSimplified(payload.group as any);
      break;
    }
    case "message": {
      const p = payload.message!;
      base.message = {
        attachments: p.chatImage,
        author: await simplifyUser(p.author),
        createdAt: p.createdAt,
        id: p.id,
        isGroupChat: p.chatRoom.isGroupChat,
        message: p.message,
        roomId: p.chatRoomId,
        updatedAt: p.updatedAt,
      };
      break;
    }
    case "post": {
      base.post = await normalizePost(payload.post!);
    }
  }

  return base;
};

export const madeReport = async (
  req: express.Request,
  res: express.Response
) => {
  const { report, type, id } = req.body;
  const { userId, uploadedImageUrls } = req as ExpressRequestExtended &
    ExpressRequestCloudinary;
  const uId = Number(userId);
  const createdReport = await Report.create({
    data: { report, type, [type + "Id"]: Number(id), reporterId: uId },
  });

  if (uploadedImageUrls && createdReport) {
    await Image.createMany({
      data: uploadedImageUrls.map((src) => ({
        src: src as string,
        reportId: createdReport.id,
      })),
    });
  }

  return res.status(201).json(new ApiResponse(createdReport, 201));
};

export const deleteReport = async (
  req: express.Request,
  res: express.Response
) => {
  const { reportId } = req.params;
  const rId = Number(reportId);
  await Report.delete({ where: { id: rId } });

  return res.status(204).json(new ApiResponse(null, 204));
};

export const getReport = async (
  req: express.Request,
  res: express.Response
) => {
  const { type } = req.query;
  const { limit, offset } = parsePaging(req);

  const reports = await Report.findMany({
    where: { type: type === "all" ? undefined : (type as any) },
    take: limit,
    skip: offset,
    orderBy: [{ createdAt: "desc" }, { type: "asc" }],
    select: selectReport,
  });

  const normalizedReports = await Promise.all(
    reports.map((r) => Promise.resolve(normalizeReport(r)))
  );

  const total = await Report.count({
    where: { type: type === "all" ? undefined : (type as any) },
  });

  return res.status(200).json(
    await getPagingObject({
      req,
      data: normalizedReports,
      total_records: total,
    })
  );
};
