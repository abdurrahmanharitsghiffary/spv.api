import { Prisma } from "@prisma/client";
import { selectSingleComment } from "./comment";
import { selectPost } from "./post";
import { selectUserSimplified } from "./user";

export const selectNotificationSimplified = {
  id: true,
  commentId: true,
  createdAt: true,
  isRead: true,
  postId: true,
  receiverId: true,
  type: true,
  userId: true,
  updatedAt: true,
  receiver: {
    select: {
      ...selectUserSimplified,
    },
  },
  user: {
    select: {
      ...selectUserSimplified,
    },
  },
} satisfies Prisma.NotificationSelect;

export type SelectNotificationSimplifiedPayload =
  Prisma.NotificationGetPayload<{
    select: typeof selectNotificationSimplified;
  }>;

export const selectNotification = {
  type: true,
  id: true,
  comment: {
    select: {
      ...selectSingleComment,
    },
  },
  createdAt: true,
  isRead: true,
  post: {
    select: {
      ...selectPost,
      comments: false,
    },
  },
  receiver: {
    select: {
      ...selectUserSimplified,
    },
  },
  user: {
    select: {
      ...selectUserSimplified,
    },
  },
  updatedAt: true,
} satisfies Prisma.NotificationSelect;

export type SelectNotificationPayload = Prisma.NotificationGetPayload<{
  select: typeof selectNotification;
}>;
