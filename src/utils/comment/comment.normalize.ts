import { getCompleteFileUrlPath } from "..";
import { SelectCommentPayload } from "../../lib/query/comment";
import { Comment } from "../../types/comment";

type SelectCommentPayloadExtended = SelectCommentPayload & {
  likes: {
    userId: number;
  }[];
  user: {
    followedBy: {
      id: number;
    }[];
  } & SelectCommentPayload["user"];
};

const normalize = (comment: SelectCommentPayloadExtended): Promise<Comment> =>
  new Promise((resolve) => {
    const normalizedComment: Comment = {
      id: comment.id,
      postId: comment.postId,
      comment: comment.comment,
      image: getCompleteFileUrlPath(comment?.image),
      isLiked: comment.likes?.[0]?.userId ? true : false,
      user: {
        id: comment.user.id,
        isFollowed: comment.user.followedBy?.[0]?.id ? true : false,
        fullName: comment.user.fullName,
        isOnline: comment.user.isOnline,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        username: comment.user.username,
        avatarImage: getCompleteFileUrlPath(comment.user.profile?.avatarImage),
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
export const normalizeComment = async (
  comment: SelectCommentPayloadExtended
) => {
  const normalizedComment: Comment = await normalize(comment);

  return normalizedComment;
};

export const normalizeComments = async (
  comments: SelectCommentPayloadExtended[]
) => {
  const normalizedComments: Comment[] = await Promise.all(
    comments.map((comment) => Promise.resolve(normalize(comment)))
  );

  return normalizedComments;
};

// if (normalizedComment.user.avatarImage)
//   normalizedComment.user.avatarImage = {
//     src: new URL(normalizedComment.user.avatarImage.src, BASE_URL).href,
//   };
// if (comment.image) {
//   normalizedComment.image = { src: new URL(comment.image.src, BASE_URL).href };
// }
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
//       src: new URL(normalizedChildComment.user.image.src, BASE_URL).href,
//     };
//   if (comment.image) {
//     normalizedChildComment.image = {
//       src: new URL(comment.image.src, BASE_URL).href,
//     };
//   }
//   return normalizedChildComment;
// }),
// total: comment._count.childrenComment,
