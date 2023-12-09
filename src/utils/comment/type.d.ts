import { Comment } from "../../types/comment";

export type FindCommentPayload = {
  id: number;
  user: {
    id: number;
    profile: {
      avatarImage: {
        id: number;
        src: string;
      } | null;
    } | null;
    firstName: string;
    lastName: string;
    fullName: string | null;
    username: string;
    isOnline: boolean;
    followedBy: {
      id: number;
    }[];
  };
  image: {
    src: string;
  } | null;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    image: number;
    likes: number;
    parentComment: number;
    childrenComment: number;
    notification: number;
    post: number;
    user: number;
  };
  likes: {
    userId: number;
  }[];
  postId: number;
  childrenComment: {
    id: number;
  }[];
};

export type VC<T extends boolean | undefined = undefined> = T extends true
  ? Comment
  : T extends undefined
  ? Comment
  : FindCommentPayload;
