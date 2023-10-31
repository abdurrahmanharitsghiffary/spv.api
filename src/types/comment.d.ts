import { number } from "zod";
import { Image } from "./profile";
import { UserSimplified } from "./user";

interface CommentSimplified {
  id: number;
  postId: number;
  comment: string;
  image: Image;
  user: UserSimplified;
  createdAt: Date;
  updatedAt: Date;
  total_likes: number;
}

interface CommentReply extends CommentSimplified {
  commentReply: {
    commentIds: number[];
    total: number;
  };
}

export interface Comment extends CommentSimplified {
  commentReply: { commentIds: number[]; total: number };
}
