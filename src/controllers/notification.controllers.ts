import express from "express";
import Notification from "../models/notification.models";
import { ApiResponse } from "../utils/response";
import { ExpressRequestExtended } from "../types/request";
import { Prisma } from "@prisma/client";
import { getPagingObject } from "../utils/paging";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import { selectNotificationSimplified } from "../lib/query/notification";
import { normalizeNotification } from "../utils/notification/notification.normalize";

export const notificationWhereAndInput = (userId?: number) =>
  [
    {
      user: {
        ...excludeBlockingUser(userId),
        ...excludeBlockedUser(userId),
      },
    },
    {
      post: {
        author: {
          ...excludeBlockingUser(userId),
          ...excludeBlockedUser(userId),
        },
      },
    },
    {
      comment: {
        user: {
          ...excludeBlockingUser(userId),
          ...excludeBlockedUser(userId),
        },
      },
    },
  ] satisfies Prisma.NotificationWhereInput["AND"];

const getTimeQuery = (time: string) => {
  let num: number = 0;

  const extractTime = (time: string, options: "y" | "h" | "d") => {
    return time.split(options)?.[0] ?? 0;
  };

  if (time.endsWith("y")) {
    num = Number(extractTime(time, "y")) * 60000 * 60 * 24 * 365;
  } else if (time.endsWith("d")) {
    num = Number(extractTime(time, "d")) * 60000 * 60 * 24;
  } else if (time.endsWith("h")) {
    num = Number(extractTime(time, "h")) * 60000 * 60;
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
  const uId = Number(userId);
  const notifications = await Notification.findMany({
    where: {
      receiverId: uId,
      OR: notificationWhereAndInput(uId),
    },
    select: {
      ...selectNotificationSimplified,
    },
    orderBy: {
      createdAt: order_by === "latest" ? "desc" : "asc",
    },
    take: Number(limit),
    skip: Number(offset),
  });
  const total_notifications = await Notification.count({
    where: {
      receiverId: uId,
      OR: notificationWhereAndInput(uId),
    },
  });

  const normalizedNotifications = (await Promise.all(
    notifications.map(async (not) => await normalizeNotification(not))
  )) as unknown;
  console.log(normalizedNotifications, "NOTIFICATIONS");
  return res.status(200).json(
    await getPagingObject({
      req,
      data: normalizedNotifications,
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
      receiverId: Number(userId),
      createdAt: {
        gt: before_timestamp
          ? new Date(Date.now() - getTimeQuery(before_timestamp as string))
          : undefined,
      },
    },
  });

  return res.status(204).json(new ApiResponse(null, 204));
};

export const readNotifications = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const uId = Number(userId);
  const { ids } = req.body;

  if (ids instanceof Array) {
    await Notification.updateMany({
      data: { isRead: true },
      where: { receiverId: uId, id: { in: ids }, isRead: false },
    });
  } else if (ids === "all") {
    await Notification.updateMany({
      where: {
        receiverId: uId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        null,
        200,
        "Successfully marking all notifications as read."
      )
    );
};
