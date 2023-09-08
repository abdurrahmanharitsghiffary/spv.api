import express from "express";
import Post from "../models/post";
import { ExpressRequestExtended } from "../types/request";
import { baseUrl } from "../lib/baseUrl";
import {
  findAllPosts,
  findPostByFollowedUserIds,
  findPostById,
  findPostsByAuthorId,
} from "../utils/findPost";
import { findCommentsByPostId } from "../utils/findComment";
import Image from "../models/image";
import { getFileDest } from "../utils/getFileDest";
import { getPagingObject } from "../utils/getPagingObject";
import User from "../models/user";
import { deleteUploadedImage } from "../utils/deleteUploadedImage";
import { jSuccess } from "../utils/jsend";
import { getCurrentUrl } from "../utils/getCurrentUrl";

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
  });

  return res.status(200).json(
    getPagingObject({
      data: posts.data,
      current: getCurrentUrl(req),
      total_records: posts.total,
      limit,
      offset,
      path: `${baseUrl}/api/me/posts`,
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
  });

  return res.status(200).json(
    getPagingObject({
      data: posts.data,
      current: getCurrentUrl(req),
      total_records: posts.total,
      limit: Number(limit),
      offset: Number(offset),
      path: `${baseUrl}/api/posts/following`,
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
      limit,
      offset,
      current: getCurrentUrl(req),
      total_records: posts.total,
      path: `${baseUrl}/api/posts`,
    })
  );
};

export const getPostCommentsById = async (
  req: express.Request,
  res: express.Response
) => {
  let { offset = 0, limit = 20 } = req.query;
  const { postId } = req.params;

  offset = Number(offset);
  limit = Number(limit);

  await findPostById(postId);

  const comments = await findCommentsByPostId(Number(postId), offset, limit);

  return res.status(200).json(
    getPagingObject({
      data: comments.data,
      total_records: comments.total,
      current: getCurrentUrl(req),
      limit,
      offset,
      path: `${baseUrl}/api/comment/posts/${postId}`,
    })
  );
};

export const getPost = async (req: express.Request, res: express.Response) => {
  const { postId } = req.params;

  const post = await findPostById(postId);

  return res.status(200).json(jSuccess(post));
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

  await Post.update({
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

    imagesDest.forEach(async (image) => {
      await Image.create({
        data: {
          postId: Number(postId),
          src: image.src,
        },
      });
    });
  }

  return res.status(204).json(jSuccess(null));
};

export const createPost = async (
  req: express.Request,
  res: express.Response
) => {
  const images = req.files ?? [];
  const { userId } = req as ExpressRequestExtended;
  const { title, content } = req.body;

  const post = await Post.create({
    data: {
      content,
      title,
      authorId: Number(userId),
    },
  });

  await Image.createMany({
    data: [
      // @ts-ignore
      ...images?.map((image: Express.Multer.File) => ({
        src: getFileDest(image),
        postId: post.id,
      })),
    ],
  });

  return res.status(201).json(jSuccess(post));
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

  await Image.deleteMany({
    where: {
      postId: Number(postId),
    },
  });

  return res.status(204).json(jSuccess(null));
};
