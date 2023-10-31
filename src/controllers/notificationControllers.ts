import express from "express";
import Notification from "../models/notification";
import { jSuccess } from "../utils/jsend";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";
import { NotificationType } from "@prisma/client";
import { getPagingObject } from "../utils/getPagingObject";
import { UserNotification } from "../types/user";

const getTimeQuery = (time: string) => {
  let num: number = 0;

  if (Number.isNaN(Number(time))) {
    throw new RequestError("Invalid time options value", 422);
  }

  if (time.endsWith("d")) {
    num = Number(time) * 60000 * 60 * 24;
  }

  if (time.endsWith("h")) {
    num = Number(time) * 60000 * 60;
  }

  if (!Number.isNaN(Number(time))) {
    num = Number(time);
  }

  return num;
};

export const getAllUserNotifications = async (
  req: express.Request,
  res: express.Response
) => {
  const { offset = 0, limit = 20, order_by = "latest" } = req.query;
  const { userId } = req as ExpressRequestExtended;

  const notifications: UserNotification[] = await Notification.findMany({
    where: {
      userId: Number(userId),
    },
    select: {
      title: true,
      content: true,
      url: true,
      type: true,
      createdAt: true,
    },
    orderBy: {
      createdAt:
        order_by === "latest"
          ? "desc"
          : order_by === undefined
          ? undefined
          : "asc",
    },
    take: Number(limit),
    skip: Number(offset),
  });

  const total_notifications = await Notification.count({
    where: {
      userId: Number(userId),
    },
  });

  return res.status(200).json(
    getPagingObject({
      req,
      data: notifications,
      total_records: total_notifications,
    })
  );
};

export const clearNotifications = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { before_timestamp } = req.query;

  await Notification.deleteMany({
    where: {
      userId: Number(userId),
      createdAt: {
        lt: before_timestamp
          ? new Date(Date.now() - getTimeQuery(before_timestamp as string))
          : undefined,
      },
    },
  });

  return res.status(204).json(jSuccess(null));
};

export const createNotification = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { title, type, content, url } = req.body as {
    title: string;
    content: string;
    type: NotificationType;
    url?: string;
  };

  const createdNotification = await Notification.create({
    data: {
      title,
      type,
      content,
      url,
      userId: Number(userId),
    },
    select: {
      title: true,
      content: true,
      type: true,
      url: true,
      createdAt: true,
    },
  });

  return res.status(201).json(jSuccess(createdNotification));
};
