import Comment from "./comment";
import { Image, ProfilePost } from "./profile";

export interface PostAuthor {
  id: number;
  username: string;
  profilePhoto: { id: number; src: string } | null;
}

export type Post = {
  id: number;
  title: string;
  postContent: string;
  likes: { total: number; likedBy: number[] };
  media: Image[] | null;
  author: PostAuthor;
  createdAt: Date;
};

type Reaction = {
  like: number;
  wow: number;
  angry: number;
  sad: number;
  love: number;
  funny: number;
} | null;

export type PostExtended = {
  commentIds: number[];
} & Post;

export type PostLikedBy = {
  userId: number;
  postId: number;
  username: string;
  profilePhoto: { src: string; id: number } | undefined | null;
};
