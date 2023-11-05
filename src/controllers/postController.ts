import express from "express";
import Post from "../models/post";
import { ExpressRequestExtended } from "../types/request";
import {
  findAllPosts,
  findPostByFollowedUserIds,
  findPostById,
  findPostsByAuthorId,
  findSavedPost,
} from "../utils/findPost";
import { findCommentsByPostId } from "../utils/findComment";
import Image from "../models/image";
import { getFileDest } from "../utils/getFileDest";
import { getPagingObject } from "../utils/getPagingObject";
import User from "../models/user";
import { deleteUploadedImage } from "../utils/deleteUploadedImage";
import { jSuccess } from "../utils/jsend";
import prisma from "../config/prismaClient";

export const getAllMyPosts = async (
  req: express.Request,
  res: express.Response
) => {
  let { offset = 0, limit = 20 } = req.query;
  const { userId } = req as ExpressRequestExtended;

  offset = Number(offset);
  limit = Number(limit);

  const posts = await findPostsByAuthorId({
    authorId: Number(userId),
    limit,
    offset,
    currentUserId: Number(userId),
  });

  return res.status(200).json(
    getPagingObject({
      data: posts.data,
      total_records: posts.total,
      req,
    })
  );
};

export const getFollowedUserPost = async (
  req: express.Request,
  res: express.Response
) => {
  const { limit = 20, offset = 0 } = req.query;
  const { userId } = req as ExpressRequestExtended;

  const followedUser = await User.findUnique({
    where: {
      id: Number(userId),
    },
    select: {
      following: true,
    },
  });

  const posts = await findPostByFollowedUserIds({
    followedUserIds: [
      ...(followedUser?.following.map((user) => user.id) ?? []),
    ],
    limit: Number(limit),
    offset: Number(offset),
    currentUserId: Number(userId),
  });

  return res.status(200).json(
    getPagingObject({
      data: posts.data,
      total_records: posts.total,
      req,
    })
  );
};

export const getAllPosts = async (
  req: express.Request,
  res: express.Response
) => {
  let { limit = 20, offset = 0 } = req.query;

  limit = Number(limit);
  offset = Number(offset);

  const posts = await findAllPosts({ limit, offset });

  return res.status(200).json(
    getPagingObject({
      data: posts.data,
      total_records: posts.total,
      req,
    })
  );
};

export const getPostCommentsById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  let { offset = 0, limit = 20, order_by = "" } = req.query;
  const { postId } = req.params;

  offset = Number(offset);
  limit = Number(limit);

  await findPostById(postId, Number(userId));

  const comments = await findCommentsByPostId(
    Number(postId),
    offset,
    limit,
    !order_by ? undefined : (order_by as string).split(","),
    Number(userId)
  );

  return res.status(200).json(
    getPagingObject({
      data: comments.data,
      total_records: comments.total,
      req,
    })
  );
};

export const getPost = async (req: express.Request, res: express.Response) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;

  const post = await findPostById(postId, Number(userId));

  return res.status(200).json(jSuccess(post));
};

export const getSavedPosts = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  let { offset = 0, limit = 20 } = req.query;
  offset = Number(offset);
  limit = Number(limit);

  const { userId } = req as ExpressRequestExtended;
  const savedPosts = await findSavedPost({
    limit,
    offset,
    userId: Number(userId),
    currentUserId: Number(currentUserId),
  });

  return res.status(200).json(
    getPagingObject({
      data: savedPosts.data,
      total_records: savedPosts.total,
      req,
    })
  );
};

export const getPostIsSaved = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;

  const savedPost = await prisma.savedPost.findUnique({
    where: {
      postId_userId: {
        postId: Number(postId),
        userId: Number(userId),
      },
    },
  });

  return res.status(200).json(jSuccess(savedPost ? true : false));
};

export const savePost = async (req: express.Request, res: express.Response) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.body;

  await findPostById(postId, Number(userId));

  const result = await prisma.savedPost.create({
    data: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  return res.status(201).json(jSuccess(result));
};

export const deleteSavedPost = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;
  await prisma.savedPost.delete({
    where: {
      postId_userId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });

  return res.status(204).json(jSuccess(null));
};

export const deletePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { postId } = req.params;

  await Post.delete({
    where: {
      id: Number(postId),
    },
  });

  return res.status(204).json(jSuccess(null));
};

export const updatePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { title, content } = req.body;
  const { postId } = req.params;
  const images = req.files ?? [];

  await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: Number(postId),
      },
      data: {
        title,
        content,
      },
    });

    if ((images.length as number) > 0) {
      const imagesDest = ((images as Express.Multer.File[]) ?? [])?.map(
        (image) => ({
          src: getFileDest(image) as string,
          postId: Number(postId),
        })
      );

      await tx.image.createMany({
        data: imagesDest,
      });
    }
  });

  return res.status(204).json(jSuccess(null));
};

export const createPost = async (
  req: express.Request,
  res: express.Response
) => {
  const images = req.files ?? [];
  const { userId } = req as ExpressRequestExtended;
  const { title, content } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: {
        content,
        title,
        authorId: Number(userId),
      },
    });

    await tx.image.createMany({
      data: [
        // @ts-ignore
        ...images?.map((image: Express.Multer.File) => ({
          src: getFileDest(image),
          postId: post.id,
        })),
      ],
    });

    return post;
  });

  return res.status(201).json(jSuccess(result));
};

export const deletePostImageById = async (
  req: express.Request,
  res: express.Response
) => {
  const { imageId, postId } = req.params;

  const deletedImage = await Image.delete({
    where: {
      id: Number(imageId),
      postId: Number(postId),
    },
  });

  await deleteUploadedImage(deletedImage.src);

  return res.status(204).json(jSuccess(null));
};

export const deletePostImagesByPostId = async (
  req: express.Request,
  res: express.Response
) => {
  const { postId } = req.params;

  const images = await Image.findMany({
    where: {
      postId: Number(postId),
    },
  });

  await Image.deleteMany({
    where: {
      postId: Number(postId),
    },
  });

  await Promise.all(
    images.map(async (img) => {
      await deleteUploadedImage(img.src);
    })
  );

  return res.status(204).json(jSuccess(null));
};
