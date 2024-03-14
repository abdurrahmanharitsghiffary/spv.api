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
import cloudinary from "../lib/cloudinary";

export const upperFirstToLower = (str: string) =>
  str?.[0]?.toUpperCase() + str?.slice(1);

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
  currentUserId,
  groupId,
  participants,
  isDeleting = false,
}: {
  participants: ParticipantsField | number[];
  groupId: number;
  currentUserId: number;
  isDeleting?: boolean;
}) => {
  const roles = {
    creator: 0,
    co_creator: 1,
    admin: 2,
    user: 3,
  } as const;
  const currentUser = await ChatRoomParticipant.findUnique({
    where: {
      chatRoomId_userId: { chatRoomId: groupId, userId: currentUserId },
    },
  });
  const currentUserRole = currentUser?.role!;
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
      const isUpdatingSelf = id === currentUserId;
      const designatedNewRole: $Enums.Role | null =
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

        const participantRole = participant?.role!;
        const isNotMemberOfTheGroup = !participant && !isAdding;

        const isAddingMemberThatAlreadyMemberOfTheGroup =
          participant && isAdding;

        const isNotAllowedUpdateToHigherRoleWithCurrentRole =
          roles[currentUserRole] > roles[designatedNewRole];
        const isNotAllowedToUpdateUserWithHigherRole =
          roles[currentUserRole] >= roles[participantRole];

        const isPromoting = isNotAllowedUpdateToHigherRoleWithCurrentRole;

        const isForbiddenForDeletingUpperRoleMemberFromGroup =
          isNotAllowedToUpdateUserWithHigherRole && isDeleting;

        if (isNotMemberOfTheGroup) {
          errors.push({
            message: `${user.fullName} is not a member of this group.`,
            groupId,
            code: Code.NOT_FOUND,
            id,
          });
          return;
        }

        if (isAddingMemberThatAlreadyMemberOfTheGroup) {
          errors.push({
            message: `${user.fullName} is already a member of this group.`,
            groupId,
            code: Code.DUPLICATE,
            id,
          });
          return;
        }

        if (isForbiddenForDeletingUpperRoleMemberFromGroup) {
          errors.push({
            message: `${upperFirstToLower(
              currentUserRole
            )} does not have permission to delete another user with role ${participantRole} from the group`,
            groupId,
            code: Code.FORBIDDEN,
            id,
          });
        }

        if (isUpdatingSelf && isNotAllowedUpdateToHigherRoleWithCurrentRole) {
          errors.push({
            code: Code.FORBIDDEN,
            id,
            groupId,
            message:
              "You are not permitted to promote yourself to a higher role.",
          });
          return;
        }

        if (isNotAllowedUpdateToHigherRoleWithCurrentRole) {
          errors.push({
            code: Code.FORBIDDEN,
            message: `${upperFirstToLower(
              currentUserRole
            )} does not have permission to promote another user to ${designatedNewRole}.`,
            id,
            groupId,
          });
        }

        if (isNotAllowedToUpdateUserWithHigherRole && !isUpdatingSelf) {
          errors.push({
            message: `${upperFirstToLower(
              currentUserRole
            )} does not have permission to ${
              isPromoting ? "promote" : "demote"
            } a user with the role ${participantRole}.`,
            code: Code.FORBIDDEN,
            id,
            groupId,
          });
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

  if (errors.length > 0)
    throw new RequestError(
      isDeleting
        ? "Failed to remove participants from the group."
        : isAdding
        ? "Failed to add participants to the group."
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

export const cloudinaryUpload = async (file: Express.Multer.File) => {
  const base64 = await convertFileToBase64(file);
  const uploadedFile = await cloudinary.uploader.upload(base64, {
    resource_type: "auto",
    public_id: `${
      file.originalname.split("." + file.mimetype.split("/")[1])[0]
    }-${Date.now()}`,
  });

  return uploadedFile;
};

export const convertFileToBase64 = (
  file: Express.Multer.File
): Promise<string> =>
  new Promise((resolve) => {
    {
      const base64 = Buffer.from(file.buffer).toString("base64");
      const dataUri = "data:" + file.mimetype + ";base64," + base64;
      resolve(dataUri);
    }
  });

export const getCloudinaryFileSrc = (
  files: (string | { src: string; fieldName: string })[] | undefined,
  key?: string
) => {
  if (files === undefined) return undefined;
  if (files.every((f) => typeof f === "string")) {
    return undefined;
  }
  const sr = files.find((f) => (f as any)?.fieldName === key);
  return (sr as any)?.src as string;
};
