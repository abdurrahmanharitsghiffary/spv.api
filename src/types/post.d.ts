import Comment from "./comment";
export interface Post {
  id: number;
  authorId: number;
  title: string;
  content: string;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  postReaction: Reaction[];
}

interface Reaction {
  id: number;
  postId: number;
  like: number;
  wow: number;
  angry: number;
  sad: number;
  love: number;
  funny: number;
}
