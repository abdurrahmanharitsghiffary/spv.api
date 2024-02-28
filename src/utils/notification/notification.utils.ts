import express from "express";
import Notification from "../../models/notification.models";
import { selectNotificationSimplified } from "../../lib/query/notification";
import { normalizeNotification } from "./notification.normalize";
import { emitSocketEvent } from "../../socket/socket.utils";
import { Socket_Id } from "../../lib/consts";
import { Socket_Event } from "../../socket/event";

type OptionBase = { userId: number; receiverId: number };
type CommentBase = { postId: number; commentId: number };
type LikingPost = { type: "liking_post"; postId: number };
type LikingComment = { type: "liking_comment" } & CommentBase;
type CommentingPost = { type: "comment" } & CommentBase;
type ReplyingComment = { type: "replying_comment" } & CommentBase;
type FollowingUser = { type: "follow" };
type ApRq = {
  type: "rejected_group_application" | "accepted_group_application";
} & { groupId: number };

type CreateNotificationOptions = (
  | LikingPost
  | LikingComment
  | CommentingPost
  | ReplyingComment
  | FollowingUser
  | ApRq
) &
  OptionBase;

export const notify = async (
  req: express.Request,
  data: CreateNotificationOptions
) => {
  if (data.receiverId === data.userId) return null;

  const createdNotification = await Notification.create({
    data: { ...data },
    select: {
      ...selectNotificationSimplified,
    },
  });

  const normalizedNotification = await normalizeNotification(
    createdNotification
  );

  emitSocketEvent(
    req,
    Socket_Id(normalizedNotification.receiverId, "USER"),
    Socket_Event.NOTIFY,
    normalizedNotification
  );

  return normalizedNotification;
};
