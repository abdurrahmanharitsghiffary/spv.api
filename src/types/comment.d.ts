export interface Comment {
  id: number;
  postId: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  reply: Comment[];
}
