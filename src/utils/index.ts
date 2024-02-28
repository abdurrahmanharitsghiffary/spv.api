import fs from "fs/promises";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import {
  ACCESS_TOKEN_SECRET,
  BASE_URL,
  REFRESH_TOKEN_SECRET,
} from "../lib/consts";
import { ParticipantField, ParticipantsField } from "../types/chat";
import Chat, { ChatRoom, ChatRoomParticipant } from "../models/chat.models";
import User from "../models/user.models";
import { Code } from "../lib/code";
import { RequestError } from "../lib/error";
import { $Enums } from "@prisma/client";
import { NotFound } from "../lib/messages";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import Notification from "../models/notification.models";
import { notificationWhereAndInput } from "../controllers/notification.controllers";

export const generateRefreshToken = async (payload: string | object | Buffer) =>
  await JWT.sign(payload, REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });

export const getFullName = (
  firstName: string,
  lastName: string,
  newFirstName?: string,
  newLastName?: string
) => {
  return `${newFirstName ?? firstName} ${newLastName ?? lastName}`;
};

export const generateAccessToken = async (payload: string | object | Buffer) =>
  await JWT.sign(payload, ACCESS_TOKEN_SECRET as string, {
    expiresIn: 3600,
    // expiresIn: 1,
  });

export const getRandomToken = (): Promise<string> => {
  return new Promise((resolve) =>
    resolve(crypto.randomBytes(32).toString("hex"))
  );
};

export const isNullOrUndefined = (data: any) => {
  return data === null || data === undefined;
};

export const checkParticipants = async ({
  currentUserRole,
  groupId,
  participants,
  isDeleting = false,
}: {
  participants: ParticipantsField | number[];
  groupId: number;
  currentUserRole: $Enums.ParticipantRole;
  isDeleting?: boolean;
}) => {
  const isAdding = (participants as any)?.[0]?.id === undefined && !isDeleting;
  const chatRoom = ChatRoom.findUnique({
    where: {
      id: groupId,
    },
  });

  if (!chatRoom) throw new RequestError(NotFound.GROUP_CHAT, 404);

  const errors: any[] = [];
  await Promise.all(
    participants.map(async (item, i) => {
      const id = isDeleting || isAdding ? item : (item as any).id;

      const participantRole: $Enums.Role | null =
        (item as ParticipantField)?.role ?? null;

      const user = await User.findUnique({
        where: {
          id,
        },
      });

      if (user) {
        const participant = await ChatRoomParticipant.findUnique({
          where: {
            chatRoomId_userId: {
              chatRoomId: groupId,
              userId: id,
            },
          },
        });

        // Check if user is participated in the group before removing them
        if (!participant && !isAdding) {
          errors.push({
            message: `${user.fullName} is not a member of this group.`,
            groupId,
            code: Code.NOT_FOUND,
            id,
          });
          return;
        }

        const IS_ADMIN_PROMOTE_USER =
          participant?.role === "user" &&
          participantRole === "admin" &&
          currentUserRole === "admin";

        const IS_ADMIN_DEMOTING_ADMIN =
          participant?.role === "admin" &&
          participantRole === "user" &&
          currentUserRole === "admin";

        const IS_ADMIN_UPDATE_CREATOR =
          participant?.role === "creator" && currentUserRole === "admin";

        const IS_UPDATING_USER_WITH_ROLE_ADMIN =
          participant?.role === "admin" && currentUserRole === "admin";

        // Check if user already exist in the group before add them
        // if user is already exist with role user and the item.role is "admin" that user will be promoted as admin in the group

        if (participant && IS_ADMIN_UPDATE_CREATOR) {
          errors.push({
            message: `Admin cannot ${
              isDeleting ? "delete" : "demote"
            } the group creator`,
            code: Code.FORBIDDEN,
            groupId,
            id,
          });
          return;
        }

        if (participant && isAdding) {
          errors.push({
            message: `${user.fullName} is already a member of this group.`,
            groupId,
            code: Code.DUPLICATE,
            id,
          });
          return;
        }

        // Check if current user "admin" role is deleting or demoting another "admin"
        // if yes it will add error because admin can't demote or delete another admin
        if (
          participant && IS_UPDATING_USER_WITH_ROLE_ADMIN && isDeleting
            ? true
            : IS_ADMIN_DEMOTING_ADMIN && !IS_ADMIN_PROMOTE_USER
        ) {
          errors.push({
            message: isDeleting
              ? "Admin can't delete another member with role admin."
              : "Admin can't dismiss another admin to user.",
            code: Code.FORBIDDEN,
            id,
            groupId,
          });
          return;
        }
      } else {
        errors.push({
          message: NotFound.USER,
          code: Code.NOT_FOUND,
          id,
        });
      }
    })
  );

  // Should we edit the code to make an admin can demote another admin? for now, nahh

  if (errors.length > 0)
    throw new RequestError(
      isDeleting
        ? "Failed to remove participants."
        : isAdding
        ? "Failed add participants into the group."
        : "Failed to update participants in the group.",
      400,
      errors
    );
};

export const getMessageCount = async (userId: number) => {
  const c = await Chat.count({
    where: {
      chatRoom: {
        participants: {
          some: {
            userId: userId,
          },
          every: {
            user: {
              ...excludeBlockedUser(userId),
              ...excludeBlockingUser(userId),
            },
          },
        },
      },
      AND: [
        {
          authorId: {
            not: userId,
          },
        },
        {
          readedBy: {
            every: {
              userId: { not: userId },
            },
          },
        },
      ],
    },
  });
  return c;
};

export const getNotificationCount = async (
  userId: number,
  isReaded: boolean | undefined = false
) => {
  const c = await Notification.count({
    where: {
      isRead: isReaded,
      receiverId: userId,
      AND: notificationWhereAndInput(userId),
    },
  });
  return c;
};
