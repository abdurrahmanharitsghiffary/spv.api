import { $Enums } from "@prisma/client";

export type AppRequest = {
  id: number;
  comment: string | null;
  createdAt: Date;
  sender: UserSimplified;
  status: $Enums.ApplicationRequestStatus;
  type: $Enums.ApplicationRequestType;
  updatedAt: Date;
};

export type MembershipRequest = {
  groupId: number;
} & AppRequest;
