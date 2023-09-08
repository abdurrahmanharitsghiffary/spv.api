import { Post } from "./post";
import { Image, ImageV2 } from "./profile";

export interface UserAccountPublic {
  id: number;
  username: string;
  profile: {
    description: string | null;
    image: Image;
  } | null;
  followedBy: {
    followerIds: number[];
    total: number;
  };
  following: {
    followedUserIds: number[];
    total: number;
  };
  postIds: {
    postIds: number[];
    total: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAccount extends UserAccountPublic {
  email: string;
  role: $Enums.Role;
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

export interface UserSimplified {
  id: number;
  username: string;
  image: Image;
}
