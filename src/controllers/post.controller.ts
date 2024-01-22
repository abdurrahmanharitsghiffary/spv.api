import express from "express";
import Post from "../models/post.models";
import { ExpressRequestExtended } from "../types/request";
import {
  findAllPosts,
  findFollowedUserPosts,
  findPostById,
  findPostsByAuthorId,
  findSavedPost,
} from "../utils/post/post.utils";
import { findCommentsByPostId } from "../utils/comment/comment.utils";
import Image from "../models/image.models";
import { prismaImageUploader } from "../utils";
import { getPagingObject } from "../utils/paging";
import { deleteUploadedImage } from "../utils";
import { ApiResponse } from "../utils/response";
import prisma from "../config/prismaClient";
import { RequestError } from "../lib/error";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import { NotFound } from "../lib/messages";

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
    await getPagingObject({
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

  const posts = await findFollowedUserPosts({
    limit: Number(limit),
    offset: Number(offset),
    currentUserId: Number(userId),
  });

  return res.status(200).json(
    await getPagingObject({
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
    await getPagingObject({
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
    await getPagingObject({
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

  return res.status(200).json(new ApiResponse(post, 200));
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
    await getPagingObject({
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

  return res.status(200).json(new ApiResponse(savedPost ? true : false, 200));
};

export const savePost = async (req: express.Request, res: express.Response) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.body;
  const pId = Number(postId);
  const uId = Number(userId);
  await findPostById(postId, Number(userId));

  const savedPost = await prisma.savedPost.findUnique({
    where: {
      postId_userId: {
        postId: pId,
        userId: uId,
      },
    },
  });

  if (savedPost) throw new RequestError("Post already saved", 409);

  const result = await prisma.savedPost.create({
    data: {
      postId: pId,
      userId: uId,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(result, 201, "Post successfully saved."));
};

export const deleteSavedPost = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;
  const pId = Number(postId);
  const uId = Number(userId);

  const post = await Post.findUnique({
    where: {
      id: pId,
      author: {
        AND: [
          {
            ...excludeBlockedUser(uId),
            ...excludeBlockingUser(uId),
          },
        ],
      },
    },
    select: {
      follower: {
        where: {
          userId: uId,
        },
        select: {
          userId: true,
        },
      },
    },
  });

  if (!post) throw new RequestError(NotFound.POST, 404);
  if (!post.follower?.[0]?.userId)
    throw new RequestError("Post is not saved", 404);

  await prisma.savedPost.delete({
    where: {
      postId_userId: {
        userId: uId,
        postId: pId,
      },
    },
  });

  return res
    .status(204)
    .json(
      new ApiResponse(null, 204, "Post successfully removed from saved posts.")
    );
};

export const deletePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { postId } = req.params;

  const deletedPost = await Post.delete({
    where: {
      id: Number(postId),
    },
    include: {
      images: {
        select: { src: true },
      },
    },
  });

  if (deletedPost.images.length > 0) {
    deletedPost.images.forEach(async (image) => {
      await deleteUploadedImage(image.src);
    });
  }

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Post successfully deleted."));
};

export const updatePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { title, content } = req.body;
  const { postId } = req.params;
  const images = (req.files as Express.Multer.File[]) ?? [];

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

    if (images && images.length > 0) {
      await prismaImageUploader(tx, images, Number(postId), "post");
    }
    return;
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Post successfully updated."));
};

export const createPost = async (
  req: express.Request,
  res: express.Response
) => {
  const images = (req.files as Express.Multer.File[]) ?? [];
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

    if (images && images.length > 0) {
      const sources = await prismaImageUploader(tx, images, post.id, "post");
      (post as any).images = sources;
    }

    return post;
  });

  return res
    .status(201)
    .json(new ApiResponse(result, 201, "Post successfully created."));
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

  return res.status(204).json(new ApiResponse(null, 204));
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

  return res.status(204).json(new ApiResponse(null, 204));
};
