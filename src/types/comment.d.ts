import { number } from "zod";
import { Image } from "./profile";
import { UserSimplifiedWF } from "./user";

interface CommentSimplified {
  id: number;
  postId: number;
  comment: string;
  image: Image;
  user: UserSimplifiedWF;
  createdAt: Date;
  updatedAt: Date;
  totalLikes: number;
}

export interface Comment extends CommentSimplified {
  replies: number[];
  totalReplies: number;
}
