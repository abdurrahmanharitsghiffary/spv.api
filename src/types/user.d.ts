import { Post } from "./post";

export interface UserAccountPublic {
  id: number;
  username: string;
  createdAt: Date;
  profile?: {
    profileDescription: string | null;
    avatarImage?: {
      id: number;
      src: string;
    } | null;
  } | null;

  followedBy: number[];
  following: number[];
  postIds: number[];
}

export interface UserAccount extends UserAccountPublic {
  email: string;
  role: $Enums.Role;
  updatedAt: Date;
}

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
