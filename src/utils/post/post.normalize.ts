import { SelectPostPayload } from "../../lib/query/post";
import { PostExtended } from "../../types/post";
import { getCompleteFileUrlPath } from "..";

type SelectPostPayloadExtended = SelectPostPayload & {
  assignedAt?: Date;
  likes: {
    userId: number;
  }[];
  follower: {
    userId: number;
  }[];
  author: {
    followedBy: {
      id: number;
    }[];
  } & SelectPostPayload["author"];
};

const normalize = (
  post: SelectPostPayloadExtended
): PostExtended | (PostExtended & { assignedAt: Date }) => {
  const normalizedPost: PostExtended | (PostExtended & { assignedAt: Date }) = {
    id: post?.id,
    title: post?.title,
    content: post?.content,
    images: (post?.images ?? []).map(
      (image) =>
        getCompleteFileUrlPath(image) as {
          src: string;
          id: number;
        }
    ),
    isBookmarked: post?.likes?.[0]?.userId ? true : false,
    isLiked: post?.follower?.[0]?.userId ? true : false,
    author: {
      isFollowed: post?.author?.followedBy?.[0]?.id ? true : false,
      id: post?.author.id,
      fullName: post?.author?.fullName,
      isOnline: post?.author?.isOnline,
      firstName: post?.author?.firstName,
      lastName: post?.author?.lastName,
      username: post?.author.username,
      avatarImage: getCompleteFileUrlPath(post?.author?.profile?.avatarImage),
    },
    total_likes: post._count.likes,
    comments: {
      ids: post.comments.map((comment) => comment.id),
      total: post._count.comments ?? 0,
    },
    updatedAt: post?.updatedAt,
    createdAt: post?.createdAt,
  };

  // @ts-ignore
  if (post?.assignedAt) {
    // @ts-ignore
    normalizedPost.assignedAt = post.assignedAt;
  }
  return normalizedPost;
};

export const normalizePost: (
  post: SelectPostPayloadExtended
) => PostExtended = (post) => {
  const normalizedPost: PostExtended = normalize(post);

  return normalizedPost;
};
