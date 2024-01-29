import { SelectPostPayload } from "../../lib/query/post";
import { Post } from "../../types/post";

type SelectPostPayloadExtended = SelectPostPayload & { assignedAt?: Date };

const normalize = (
  post: SelectPostPayloadExtended
): Promise<Post | (Post & { assignedAt: Date })> =>
  new Promise((resolve) => {
    const normalizedPost: Post | (Post & { assignedAt: Date }) = {
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
      total_comments: post._count.comments,
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
) => Promise<Post> = async (post) => {
  const normalizedPost: Post = await normalize(post);

  return normalizedPost;
};
