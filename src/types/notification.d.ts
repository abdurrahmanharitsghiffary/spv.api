import { $Enums } from "@prisma/client";
import { UserSimplified } from "./user";

type BaseNotification = {
  senderId: number;
  receiverId: number;
  sender: UserSimplified;
  receiver: UserSimplified;
  isRead: boolean;
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

type BaseCommentNotification = { commentId: number; postId: number };
type LikingPost = { type: "liking_post"; postId: number };
type ReplyingComment = { type: "replying_comment" } & BaseCommentNotification;
type CommentingPost = { type: "comment" } & BaseCommentNotification;
type LikingComment = { type: "liking_comment" } & BaseCommentNotification;
type FollowingUser = { type: "follow" };

export type Notification = (
  | LikingComment
  | ReplyingComment
  | CommentingPost
  | LikingPost
  | FollowingUser
) &
  BaseNotification;
