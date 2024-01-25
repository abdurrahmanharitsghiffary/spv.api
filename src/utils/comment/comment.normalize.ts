import { SelectCommentPayload } from "../../lib/query/comment";
import { Comment } from "../../types/comment";

const normalize = (comment: SelectCommentPayload): Promise<Comment> =>
  new Promise((resolve) => {
    const normalizedComment: Comment = {
      id: comment.id,
      postId: comment.postId,
      comment: comment.comment,
      image: comment?.image,
      user: {
        id: comment.user.id,
        fullName: comment.user.fullName,
        isOnline: comment.user.isOnline,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        username: comment.user.username,
        avatarImage: comment.user.profile?.avatarImage,
      },
      total_likes: comment._count.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,

      replies: {
        ids: comment.childrenComment.map((comment) => comment.id),
        total: comment._count.childrenComment,
      },
    };

    return resolve(normalizedComment);
  });
export const normalizeComment = async (comment: SelectCommentPayload) => {
  const normalizedComment: Comment = await normalize(comment);

  return normalizedComment;
};

export const normalizeComments = async (comments: SelectCommentPayload[]) => {
  const normalizedComments: Comment[] = await Promise.all(
    comments.map((comment) => Promise.resolve(normalize(comment)))
  );

  return normalizedComments;
};
