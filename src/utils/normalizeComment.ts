import { baseUrl } from "../lib/baseUrl";
import { SelectCommentPayload } from "../lib/query/comment";
import { Comment } from "../types/comment";

const normalize = (comment: SelectCommentPayload): Comment => {
  const normalizedComment: Comment = {
    id: comment.id,
    postId: comment.postId,
    comment: comment.comment,
    image: comment.image,
    user: {
      id: comment.user.id,
      firstName: comment.user.firstName,
      lastName: comment.user.lastName,
      username: comment.user.username,
      image: comment.user.profile?.avatarImage,
    },
    total_likes: comment._count.likes,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,

    commentReply: {
      commentIds: comment.childrenComment.map((comment) => comment.id),
      total: comment._count.childrenComment,
      // comments: comment.childrenComment.map((comment) => {
      //   const normalizedChildComment = {
      //     id: comment.id,
      //     postId: comment.postId,
      //     image: comment.image,
      //     comment: comment.comment,
      //     user: {
      //       id: comment.user.id,
      //       username: comment.user.username,
      //       image: comment.user.profile?.avatarImage,
      //     },
      //     total_likes: comment._count.likes,
      //     createdAt: comment.createdAt,
      //     updateAt: comment.updatedAt,
      //     commentReply: {
      //       commentIds: comment.childrenComment.map((comment) => comment.id),
      //       total: comment._count.childrenComment,
      //     },
      //   };
      //   if (normalizedChildComment.user.image)
      //     normalizedChildComment.user.image = {
      //       src: new URL(normalizedChildComment.user.image.src, baseUrl).href,
      //     };
      //   if (comment.image) {
      //     normalizedChildComment.image = {
      //       src: new URL(comment.image.src, baseUrl).href,
      //     };
      //   }
      //   return normalizedChildComment;
      // }),
      // total: comment._count.childrenComment,
    },
  };

  if (normalizedComment.user.image)
    normalizedComment.user.image = {
      src: new URL(normalizedComment.user.image.src, baseUrl).href,
    };
  if (comment.image) {
    normalizedComment.image = { src: new URL(comment.image.src, baseUrl).href };
  }
  return normalizedComment;
};
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
