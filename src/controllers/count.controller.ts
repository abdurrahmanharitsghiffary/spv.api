import express from "express";
import { ExpressRequestExtended } from "../types/request";
import User from "../models/user.models";
import Chat, { ChatRoom } from "../models/chat.models";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import Comment, { CommentLike } from "../models/comment.models";
import Post, { PostLike } from "../models/post.models";
import { Prisma } from "@prisma/client";
import { getMessageCount, getNotificationCount } from "../utils";
import prisma from "../config/prismaClient";
import { ApiResponse } from "../utils/response";

type Counts = {
  readedMessages?: number;
  readedNotifications?: number;
  likedPosts?: number;
  likedComments?: number;
  unreadMessages?: number;
  unreadNotifications?: number;
  notifications?: number;
  messages?: number;
  posts?: number;
  savedPosts?: number;
  followers?: number;
  followedUsers?: number;
  blockedUsers?: number;
  chatRooms?: number;
  participatedGroups?: number;
  comments?: number;
};

// type CountType = keyof Counts;

type CountType =
  | "readed_messages"
  | "readed_notifications"
  | "liked_posts"
  | "liked_comments"
  | "unread_messages"
  | "unread_notifications"
  | "notifications"
  | "messages"
  | "posts"
  | "saved_posts"
  | "followers"
  | "followed_users"
  | "blocked_users"
  | "chat_rooms"
  | "participated_groups"
  | "comments";

export const defaultTypes: CountType[] = [
  "readed_messages",
  "readed_notifications",
  "liked_posts",
  "liked_comments",
  "unread_messages",
  "unread_notifications",
  "notifications",
  "messages",
  "posts",
  "saved_posts",
  "followers",
  "followed_users",
  "blocked_users",
  "chat_rooms",
  "participated_groups",
  "comments",
];

const convertType = (type: CountType) => {
  const t = type.split("_");
  const t2 = t?.[1] ?? "";
  const uT2 = (t2?.[0] ?? "").toUpperCase() + (t2 ?? "").slice(1);

  return `${t[0]}${uT2}` as keyof Counts;
};

const filterGroupChatCount = (userId: number) =>
  [
    {
      isGroupChat: false,
      participants: {
        every: {
          user: {
            ...excludeBlockedUser(userId),
            ...excludeBlockingUser(userId),
          },
        },
        some: {
          userId,
        },
      },
    },
    { isGroupChat: true, participants: { some: { userId } } },
  ] satisfies Prisma.ChatRoomWhereInput["OR"];

export const getCounts = async (
  req: express.Request,
  res: express.Response
) => {
  const { type = "" } = req.query;
  const { userId } = req as ExpressRequestExtended;
  const uId = Number(userId);

  let countTypes = type.toString().split(",") as CountType[];

  if (
    countTypes?.includes("" as any) ||
    (countTypes ?? []).length <= 0 ||
    countTypes === undefined
  ) {
    countTypes = defaultTypes;
  }

  console.log(countTypes, "Types");

  const counts: Counts = {};

  await Promise.all(
    countTypes.map(async (type) => {
      console.log(convertType(type));
      counts[convertType(type)] = await getCountByType(type, uId);
    })
  );

  res.status(200).json(new ApiResponse(counts, 200));
};

const getCountByType = async (type: CountType, userId: number) => {
  switch (type as CountType) {
    case "blocked_users": {
      const c = await User.count({
        where: {
          id: { not: userId },
          blocking: { some: { id: userId } },
        },
      });
      return c;
    }
    case "chat_rooms": {
      const c = await ChatRoom.count({
        where: {
          OR: filterGroupChatCount(userId),
        },
      });
      return c;
    }
    case "comments": {
      const c = await Comment.count({ where: { userId } });
      return c;
    }
    case "followed_users": {
      const c = await User.count({
        where: {
          id: { not: userId },
          ...excludeBlockedUser(userId),
          ...excludeBlockingUser(userId),
          followedBy: { some: { id: userId } },
        },
      });
      return c;
    }
    case "followers": {
      const c = await User.count({
        where: {
          id: { not: userId },
          ...excludeBlockedUser(userId),
          ...excludeBlockingUser(userId),
          following: { some: { id: userId } },
        },
      });
      return c;
    }
    case "liked_comments": {
      const c = await CommentLike.count({ where: { userId } });
      return c;
    }
    case "liked_posts": {
      const c = await PostLike.count({ where: { userId } });
      return c;
    }
    case "messages": {
      const c = await Chat.count({
        where: {
          authorId: userId,
          chatRoom: { OR: filterGroupChatCount(userId) },
        },
      });
      return c;
    }
    case "notifications": {
      const c = await getNotificationCount(userId, undefined);
      return c;
    }
    case "participated_groups": {
      const c = await ChatRoom.count({
        where: { isGroupChat: true, participants: { some: { userId } } },
      });
      return c;
    }
    case "posts": {
      const c = await Post.count({ where: { authorId: userId } });
      return c;
    }
    case "readed_messages": {
      const c = await Chat.count({
        where: {
          chatRoom: {
            participants: {
              some: {
                userId: userId,
              },
              every: {
                user: {
                  ...excludeBlockedUser(userId),
                  ...excludeBlockingUser(userId),
                },
              },
            },
          },
          AND: [{ authorId: { not: userId }, readedBy: { some: { userId } } }],
        },
      });
      return c;
    }
    case "unread_messages": {
      const c = await getMessageCount(userId);
      return c;
    }
    case "readed_notifications": {
      const c = await getNotificationCount(userId, true);
      return c;
    }
    case "unread_notifications": {
      const c = await getNotificationCount(userId, false);
      return c;
    }
    case "saved_posts": {
      const c = await prisma.savedPost.count({ where: { userId } });
      return c;
    }
  }
};
