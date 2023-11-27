import prisma from "../config/prismaClient";
import { getFileDest } from "../utils";
const Comment = prisma.comment;
const CommentLike = prisma.commentLike;

export const createOneComment = async ({
  comment,
  postId,
  userId,
  parentId,
  image,
}: {
  comment: string;
  postId: number;
  parentId?: number | null;
  userId: number;
  image?: Express.Multer.File | string | undefined;
}) =>
  await prisma.$transaction(async (tx) => {
    const createdComment = await tx.comment.create({
      data: {
        comment,
        parentId,
        postId,
        userId,
      },
    });

    if (image && typeof image !== "string") {
      await tx.image.create({
        data: {
          src: getFileDest(image) as string,
          commentId: createdComment.id,
        },
      });
    } else if (image) {
      await tx.image.create({
        data: {
          src: image,
          commentId: createdComment.id,
        },
      });
    }
    return createdComment;
  });

export { CommentLike };
export default Comment;
