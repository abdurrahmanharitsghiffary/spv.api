import { SelectCommentPayload } from "../lib/query/comment";
import { Comment } from "../types/comment";

const normalize = (comment: SelectCommentPayload) => ({
  id: comment.id,
  postId: comment.postId,
  comment: comment.comment,
  image: comment.image,
  user: {
    id: comment.user.id,
    profilePhoto: comment.user.profile?.avatarImage,
    username: comment.user.username,
  },
  createdAt: comment.createdAt,
  commentReplyIds: [...comment.childrenComment.map((comment) => comment.id)],
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
