import { Prisma } from "@prisma/client";
// import { selectChatRoom } from "./chat";
import { selectUserSimplified } from "./user";
export const selectAppRequest = {
  comment: true,
  id: true,
  createdAt: true,
  user: { select: { ...selectUserSimplified } },
  type: true,
  status: true,
  updatedAt: true,
} satisfies Prisma.ApplicationRequestSelect;

export const selectGroupMembershipRequest = {
  ...selectAppRequest,
  groupId: true,
} satisfies Prisma.ApplicationRequestSelect;

export type SelectGroupMembershipRequestPayload =
  Prisma.ApplicationRequestGetPayload<{
    select: typeof selectGroupMembershipRequest;
  }>;

export type SelectAppRequestPayload = Prisma.ApplicationRequestGetPayload<{
  select: typeof selectAppRequest;
}>;
