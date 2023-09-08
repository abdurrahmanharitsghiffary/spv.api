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
  updateAt: Date;
}

interface CommentReply extends CommentSimplified {
  commentReply: {
    commentIds: number[];
    total: number;
  };
}

export interface Comment extends CommentSimplified {
  commentReply: { comments: CommentReply[]; total: number };
}
