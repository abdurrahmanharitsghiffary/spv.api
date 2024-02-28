import Comment from "./comment";
import { Image, ProfilePost } from "./profile";
import { UserSimplifiedWF } from "./user";

export type Post = {
  id: number;
  title: string | null;
  content: string;
  images: (Image & { id: number })[] | null;
  author: UserSimplifiedWF;
  totalLikes: number;
  createdAt: Date;
  updatedAt: Date;
  totalComments: number;
};
