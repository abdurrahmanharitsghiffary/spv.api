import { SelectPostPayload } from "../../lib/query/post";
import { PostExtended } from "../../types/post";

type SelectPostPayloadExtended = SelectPostPayload & { assignedAt?: Date };

const normalize = (
  post: SelectPostPayloadExtended
): Promise<PostExtended | (PostExtended & { assignedAt: Date })> =>
  new Promise((resolve) => {
    const normalizedPost: PostExtended | (PostExtended & { assignedAt: Date }) =
      {
        id: post?.id,
        title: post?.title,
        content: post?.content,
        images: post?.images ?? [],
        author: {
          id: post?.author.id,
          fullName: post?.author?.fullName,
          isOnline: post?.author?.isOnline,
          firstName: post?.author?.firstName,
          lastName: post?.author?.lastName,
          username: post?.author.username,
          avatarImage: post?.author?.profile?.avatarImage,
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
    return resolve(normalizedPost);
  });

export const normalizePost: (
  post: SelectPostPayloadExtended
) => Promise<PostExtended> = async (post) => {
  const normalizedPost: PostExtended = await normalize(post);

  return normalizedPost;
};
