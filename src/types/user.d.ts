import { Post } from "./post";

export interface User {
  id: number;
  username: string;
  email: string;
  hashedPassword: string;
  profile: Profile;
  createdAt: Date;
  updatedAt: Date;
  followedBy: User[];
  following: User[];
  posts: Post[];
}

export interface Profile {
  id: number;
  description: string;
  userId: number;
}
