import Comment from "./comment";
import { Image, ProfilePost } from "./profile";
import { UserSimplified } from "./user";

export type Post = {
  id: number;
  title: string;
  content: string;
  likes: { total: number; likedBy: UserSimplified[] };
  images: Image[] | null;
  author: UserSimplified;
  createdAt: Date;
  updatedAt: Date;
};

export type PostExtended = {
  comments: {
    commentIds: number[];
    total: number;
  };
} & Post;
