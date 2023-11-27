import express from "express";
import Notification from "../models/notification.models";
import { ApiResponse } from "../utils/response";
import { ExpressRequestExtended } from "../types/request";
import { NotificationType, Prisma } from "@prisma/client";
import { getPagingObject } from "../utils/paging";
import { NotificationBase } from "../types/notification";
import {
  excludeBlockedUser,
  excludeBlockingUser,
  selectUserSimplified,
} from "../lib/query/user";

const notificationSelect = (userId?: number | string) =>
  ({
    id: true,
    type: true,
    isRead: true,
    user: {
      select: {
        ...selectUserSimplified,
      },
    },
    post: {
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: {
            ...selectUserSimplified,
          },
        },
      },
      where: {
        author: {
          ...excludeBlockingUser(Number(userId)),
          ...excludeBlockedUser(Number(userId)),
        },
      },
    },
    comment: {
      select: {
        id: true,
        comment: true,
        user: {
          select: {
            ...selectUserSimplified,
          },
        },
      },
      where: {
        user: {
          ...excludeBlockingUser(Number(userId)),
          ...excludeBlockedUser(Number(userId)),
        },
      },
    },
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.NotificationSelect);

const notificationWhereAndInput = (userId?: number | string) =>
  [
    {
      user: {
        ...excludeBlockingUser(Number(userId)),
        ...excludeBlockedUser(Number(userId)),
      },
    },
    {
      post: {
        author: {
          ...excludeBlockingUser(Number(userId)),
          ...excludeBlockedUser(Number(userId)),
        },
      },
    },
    {
      comment: {
        user: {
          ...excludeBlockingUser(Number(userId)),
          ...excludeBlockedUser(Number(userId)),
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

  const notifications: NotificationBase[] = await Notification.findMany({
    where: {
      receiverId: Number(userId),
      AND: notificationWhereAndInput(userId),
    },
    select: notificationSelect(userId),
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
      receiverId: Number(userId),
      AND: notificationWhereAndInput(userId),
    },
  });

  return res.status(200).json(
    await getPagingObject({
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
      receiverId: Number(userId),
      createdAt: {
        lt: before_timestamp
          ? new Date(Date.now() - getTimeQuery(before_timestamp as string))
          : undefined,
      },
    },
  });

  return res.status(204).json(new ApiResponse(null, 204));
};

export const createNotification = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { type, receiverId, postId, commentId } = req.body as {
    type: NotificationType;
    receiverId: string | number;
    commentId?: number;
    postId?: number;
  };

  let createdNotification: any = null;

  const response = (data: any) =>
    res.status(201).json(new ApiResponse(data, 201));

  switch (type) {
    case "comment":
      {
        createdNotification = await Notification.create({
          data: {
            type,
            receiverId: Number(receiverId),
            userId: Number(userId),
            postId: Number(postId),
          },
          select: notificationSelect(userId),
        });
      }
      break;
    case "follow":
      {
        createdNotification = await Notification.create({
          data: {
            type,
            receiverId: Number(receiverId),
            userId: Number(userId),
          },
          select: notificationSelect(userId),
        });
      }
      break;
    case "liking_comment":
      {
        createdNotification = await Notification.create({
          data: {
            type,
            receiverId: Number(receiverId),
            userId: Number(userId),
            commentId: Number(commentId),
          },
          select: notificationSelect(userId),
        });
      }
      break;
    case "liking_post":
      {
        createdNotification = await Notification.create({
          data: {
            type,
            receiverId: Number(receiverId),
            userId: Number(userId),
            postId: Number(postId),
          },
          select: notificationSelect(userId),
        });
      }
      break;
    case "replying_comment":
      {
        createdNotification = await Notification.create({
          data: {
            type,
            receiverId: Number(receiverId),
            userId: Number(userId),
            commentId: Number(commentId),
          },
          select: notificationSelect(userId),
        });
      }
      break;
    default: {
      return null;
    }
  }

  return response(createdNotification);
};
