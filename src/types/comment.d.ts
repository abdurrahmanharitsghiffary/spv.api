import { number } from "zod";
import { Image } from "./profile";
import { UserSimplifiedWF } from "./user";

interface CommentSimplified {
  id: number;
  postId: number;
  comment: string;
  image: Image;
  user: UserSimplifiedWF;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
  total_likes: number;
}

export interface Comment extends CommentSimplified {
  replies: { ids: number[]; total: number };
}
