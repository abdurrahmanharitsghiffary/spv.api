import { Image } from "./profile";
import { UserSimplified } from "./user";

export type Chat = {
  id: number;
  message: string | null;
  image: Image;
  author: UserSimplified;
  recipient: UserSimplified;
  createdAt: Date;
  updatedAt: Date;
};
