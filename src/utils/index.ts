import fs from "fs/promises";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import {
  ACCESS_TOKEN_SECRET,
  BASE_URL,
  REFRESH_TOKEN_SECRET,
} from "../lib/consts";
import { ParticipantField, ParticipantsField } from "../types/chat";
import { ChatRoom, ChatRoomParticipant } from "../models/chat.models";
import User from "../models/user.models";
import { Code } from "../lib/code";
import { RequestError } from "../lib/error";
import { $Enums, Prisma, PrismaClient } from "@prisma/client";
import { NotFound } from "../lib/messages";
import { DefaultArgs } from "@prisma/client/runtime/library";
export const deleteUploadedImage = async (src: string) => {
  const path = src.split("public/")[1];
  try {
    await fs.unlink("src/public/" + path);
  } catch (err: any) {
    throw new Error(err);
  }
};

export const generateRefreshToken = async (payload: string | object | Buffer) =>
  await JWT.sign(payload, REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });

export const generateAccessToken = async (payload: string | object | Buffer) =>
  await JWT.sign(payload, ACCESS_TOKEN_SECRET as string, {
    expiresIn: 3600,
    // expiresIn: 1,
  });

export const getFileDest = (file: Express.Multer.File | undefined) => {
  if (!file) return null;
  return file?.destination.replace("src", "") + `/${file?.filename}`;
};

export const getCompleteFileUrlPath = (
  profile: { src: string; id?: number } | null | undefined
) => {
  if (!profile) return null;
  try {
    const url = new URL(profile.src, BASE_URL);
    return { ...profile, src: url.href };
  } catch (err) {
    return null;
  }
};

export const getRandomToken = (): Promise<string> => {
  return new Promise((resolve) =>
    resolve(crypto.randomBytes(32).toString("hex"))
  );
};

export const isNullOrUndefined = (data: any) => {
  return data === null || data === undefined;
};

export const checkParticipants = async (
  participants: ParticipantsField | number[],
  groupId: number,
  currentUserRole: $Enums.ParticipantRole,
  isDeleting: boolean = false
) => {
  const chatRoom = ChatRoom.findUnique({
    where: {
      id: groupId,
    },
  });

  if (!chatRoom) throw new RequestError(NotFound.GROUP_CHAT, 404);

  const errors: any[] = [];
  await Promise.all(
    participants.map(async (item, i) => {
      const id = isDeleting ? item : (item as any).id;

      const participantRole: $Enums.Role | null =
        (item as ParticipantField)?.role ?? null;

      const user = await User.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
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
        if (isDeleting && !participant && user) {
          errors.push({
            message: `Can't found participant with ID ${id} in the group.`,
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

        const IS_USER_ALREADY_EXIST =
          participant && participant?.role === participantRole;

        // Check if user already exist in the group before add them
        // if user is already exist with role user and the item.role is "admin" that user will be promoted as admin in the group

        if (participant && IS_ADMIN_UPDATE_CREATOR) {
          errors.push({
            message: `Admin cannot ${
              isDeleting ? "delete" : "demote"
            } group creator`,
            code: Code.FORBIDDEN,
            groupId,
            id,
          });
          return;
        }

        if (IS_USER_ALREADY_EXIST && !isDeleting) {
          errors.push({
            message: `Participant with ID ${id} already exists in the group.`,
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
              ? "Can't delete user with role admin with current role (admin)"
              : "Can't demote admin to user with current role (admin)",
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
        : "Failed add participants into the group.",
      400,
      errors
    );
};

export const imageUploadErrorHandler = async (
  imageUploader: Promise<Prisma.BatchPayload>,
  imageSources: Prisma.ImageCreateManyInput[] | Prisma.ImageCreateManyInput
) => {
  try {
    const uploadedBatch = await imageUploader;
    console.log(uploadedBatch, "Uploaded Batch");
  } catch (err) {
    console.log("Something goes wrong.", err);
    if (imageSources instanceof Array) {
      await Promise.all(
        imageSources.map(async (image) => {
          await deleteUploadedImage(image.src);
        })
      );
    } else {
      await deleteUploadedImage(imageSources.src);
    }
  }
};

export const prismaImageUploader = async (
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  images: Express.Multer.File[] | Express.Multer.File,
  id: number,
  imageType: "post" | "profile" | "chat" | "comment" | "group"
) => {
  try {
    const imageSources: Prisma.ImageCreateManyInput[] = [];
    if (images instanceof Array) {
      images.forEach((image) => {
        const fileDest = getFileDest(image);
        if (fileDest)
          imageSources.push({
            src: fileDest,
            [imageType + "Id"]: id,
          });
      });
    } else {
      const fileDest = getFileDest(images);
      if (fileDest)
        imageSources.push({
          src: fileDest,
          [imageType + "Id"]: id,
        });
    }
    await imageUploadErrorHandler(
      tx.image.createMany({ data: imageSources }),
      imageSources
    );
    return imageSources;
  } catch (err) {
    console.error("Something went wrong when uploading images, Error: ", err);
  }
};
