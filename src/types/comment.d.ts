export interface Comment {
  id: number;
  postId: number;
  comment: string;
  image: { src: string; id: number } | null;
  user: {
    id: number;
    username: string;
    profilePhoto:
      | {
          id: number;
          src: string;
        }
      | null
      | undefined;
  };
  createdAt: Date;
  commentReplyIds: number[];
}
