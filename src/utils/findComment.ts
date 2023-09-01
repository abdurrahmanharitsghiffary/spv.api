import { RequestError } from "../lib/error";
import { selectComment } from "../lib/query/comment";
import Comment from "../models/comment";
import { normalizeComment, normalizeComments } from "./normalizeComment";

export const findCommmentById = async (commentId: string) => {
  const comment = await Comment.findUnique({
    where: {
      id: Number(commentId),
    },
    select: selectComment,
  });

  if (!comment) throw new RequestError("Comment not found", 404);

  return normalizeComment(comment);
};

export const findCommentsByPostId = async (
  postId: number,
  offset: number,
  limit: number
) => {
  const comments = await Comment.findMany({
    where: {
      postId: postId,
    },
    take: limit,
    skip: offset,
    select: selectComment,
  });

  return normalizeComments(comments);
};
