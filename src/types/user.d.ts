import { Post } from "./post";
import { Image, ImageV2 } from "./profile";

export interface UserAccountPublic {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  profile: {
    description: string | null;
    image: Image;
    coverImage: Image;
  } | null;
  followedBy: {
    followerIds: number[];
    total: number;
  };
  following: {
    followedUserIds: number[];
    total: number;
  };
  posts: {
    postIds: number[];
    total: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAccount extends UserAccountPublic {
  email: string;
  verified: boolean;
  role: $Enums.Role;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
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
  firstName: string;
  lastName: string;
  username: string;
  image: Image;
}

export interface UserNotification {
  title: string;
  content: string;
  type: $Enums.NotificationType;
  url: string | null;
  createdAt: Date;
}
