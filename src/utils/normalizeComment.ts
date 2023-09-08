import { SelectCommentPayload } from "../lib/query/comment";
import { Comment } from "../types/comment";

const normalize = (comment: SelectCommentPayload): Comment => ({
  id: comment.id,
  postId: comment.postId,
  comment: comment.comment,
  image: comment.image,
  user: {
    id: comment.user.id,
    image: comment.user.profile?.avatarImage,
    username: comment.user.username,
  },
  createdAt: comment.createdAt,
  updateAt: comment.updatedAt,
  commentReply: {
    comments: comment.childrenComment.map((comment) => ({
      id: comment.id,
      comment: comment.comment,
      createdAt: comment.createdAt,
      image: comment.image,
      postId: comment.postId,
      updateAt: comment.updatedAt,
      user: {
        id: comment.user.id,
        image: comment.user.profile?.avatarImage,
        username: comment.user.username,
      },
      commentReply: {
        commentIds: comment.childrenComment.map((comment) => comment.id),
        total: comment._count.childrenComment,
      },
    })),
    total: comment._count.childrenComment,
  },
});

export const normalizeComment = (comment: SelectCommentPayload) => {
  const normalizedComment: Comment = normalize(comment);

  return normalizedComment;
};

export const normalizeComments = (comments: SelectCommentPayload[]) => {
  const normalizedComments: Comment[] = comments.map((comment) =>
    normalize(comment)
  );

  return normalizedComments;
};
