import express from "express";
import User from "../models/user.models";
import Profile from "../models/profile.models";
import {
  findAllUser,
  findUserById,
  findUserPublic,
} from "../utils/user/user.utils";
import { getPagingObject } from "../utils/paging";
import { ApiResponse } from "../utils/response";
import { findPostsByAuthorId } from "../utils/post/post.utils";
import {
  ExpressRequestCloudinary,
  ExpressRequestExtended,
} from "../types/request";
import { cloudinaryUpload, getCloudinaryFileSrc, getFullName } from "../utils";
import { hash } from "bcrypt";
import { BCRYPT_SALT, errorsMessage } from "../lib/consts";
import { RequestError } from "../lib/error";
import { normalizeUser } from "../utils/user/user.normalize";
import { selectUser } from "../lib/query/user";
import Image, { CoverImage } from "../models/image.models";

export const getUser = async (req: express.Request, res: express.Response) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  const { userId } = req.params;
  const user = await findUserPublic(userId, Number(currentUserId));

  return res.status(200).json(new ApiResponse(user, 200));
};

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  let { limit = 20, offset = 0 } = req.query;
  limit = Number(limit);
  offset = Number(offset);
  const users = await findAllUser({ limit, offset });

  return res.status(200).json(
    await getPagingObject({
      data: users.data,
      total_records: users.total,
      req,
    })
  );
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  await findUserById(Number(userId));

  await User.delete({ where: { id: Number(userId) } });
  return res
    .status(204)
    .json(new ApiResponse(null, 204, "User successfully deleted."));
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { uploadedImageUrls } = req as ExpressRequestCloudinary;
  const profileImageSrc = getCloudinaryFileSrc(uploadedImageUrls, "profile");
  const coverImageSrc = getCloudinaryFileSrc(uploadedImageUrls, "cover");

  const { userId } = req.params;
  const {
    username,
    description,
    role,
    firstName,
    lastName,
    gender,
    birthDate,
  } = req.body;

  await findUserById(Number(userId));

  const user = await User.update({
    where: {
      id: Number(userId),
    },
    data: {
      role,
      firstName,
      lastName,
      fullName: getFullName(firstName, lastName),
      username,
    },
    include: { profile: { select: { id: true } } },
  });

  if (!user) throw new RequestError("Something went wrong!", 400);

  await Profile.upsert({
    where: {
      userId: user.email,
    },
    update: {
      gender,
      birthDate,
      profileDescription: description,
    },
    create: {
      userId: user.email,
      profileDescription: description,
      gender,
      birthDate,
    },
  });

  if (coverImageSrc) {
    await CoverImage.upsert({
      create: { profileId: user.profile?.id, src: coverImageSrc },
      update: { src: coverImageSrc },
      where: { profileId: user.profile?.id },
    });
  }

  if (profileImageSrc) {
    await Image.upsert({
      create: { profileId: user.profile?.id, src: profileImageSrc },
      update: { src: profileImageSrc },
      where: { profileId: user.profile?.id },
    });
  }

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "User successfully updated."));
};

export const getPostByUserId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  let { offset = 0, limit = 20 } = req.query;
  const { userId } = req.params;

  offset = Number(offset);
  limit = Number(limit);

  const posts = await findPostsByAuthorId({
    authorId: Number(userId),
    limit,
    offset,
    currentUserId: Number(currentUserId),
  });

  return res.status(200).json(
    await getPagingObject({
      data: posts.data,
      total_records: posts.total,
      req,
    })
  );
};

export const getUserIsFollowed = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: uId } = req.params;
  const { userId } = req as ExpressRequestExtended;
  const isFollowed = await User.findUnique({
    where: {
      id: Number(uId),
      followedBy: {
        some: {
          id: Number(userId),
        },
      },
    },
  });

  return res.status(200).json(new ApiResponse(isFollowed ? true : false, 200));
};

type EMU = Express.Multer.File | undefined;

export const createUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { uploadedImageUrls } = req as ExpressRequestCloudinary;

  const coverImageSrc = getCloudinaryFileSrc(uploadedImageUrls, "cover");
  const profileImageSrc = getCloudinaryFileSrc(uploadedImageUrls, "profile");

  const {
    email,
    firstName,
    lastName,
    username,
    password,
    confirmPassword,
    role = "user",
    gender,
    birthDate,
  } = req.body;

  if (password !== confirmPassword)
    throw new RequestError(errorsMessage.FAILED_CONFIRMATION_MESSAGE, 401);

  const hashedPassword = await hash(password, Number(BCRYPT_SALT));

  const createdUser = await User.create({
    data: {
      email,
      firstName,
      lastName,
      username,
      fullName: getFullName(firstName, lastName),
      hashedPassword,
      role,
      profile: {
        create: {
          gender,
          birthDate,
          avatarImage: profileImageSrc
            ? { create: { src: profileImageSrc } }
            : undefined,
          coverImage: coverImageSrc
            ? { create: { src: coverImageSrc } }
            : undefined,
        },
      },
    },
    select: selectUser,
  });

  const normalizedUser = await normalizeUser(createdUser);

  return res.status(201).json(new ApiResponse(normalizedUser, 201));
};
