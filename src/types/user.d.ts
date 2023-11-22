import { $Enums } from "@prisma/client";
import { Post } from "./post";
import { Image, ImageV2 } from "./profile";

export interface UserAccountPublic {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string | null;
  username: string;
  profile: {
    birthDate: Date | null;
    gender: $Enums.Gender | null;
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
  provider: $Enums.AuthProvider | null;
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

export type SearchFilter = "followed" | "not_followed";
