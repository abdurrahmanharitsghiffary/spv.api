import { baseUrl } from "../lib/baseUrl";
import { SelectPostPayload } from "../lib/query/post";
import { Post, PostExtended } from "../types/post";
import { getFilePathname } from "./getFilePathname";

const normalize = (post: SelectPostPayload): PostExtended => {
  const normalizedPost: PostExtended = {
    id: post?.id,
    title: post?.title,
    content: post?.content,
    images: post?.images,
    author: {
      id: post?.author.id,
      firstName: post?.author?.firstName,
      lastName: post?.author?.lastName,
      username: post?.author.username,
      image: getFilePathname(post?.author?.profile?.avatarImage),
    },
    total_likes: post._count.likes,
    comments: {
      commentIds: post.comments.map((comment) => comment.id),
      total: post._count.comments ?? 0,
    },
    updatedAt: post?.updatedAt,
    createdAt: post?.createdAt,
  };
  if (post.images.length > 0) {
    normalizedPost.images = post.images.map((image) => ({
      ...image,
      src: new URL(image.src, baseUrl).href,
    }));
  }
  // @ts-ignore
  if (post?.assignedAt) {
    // @ts-ignore
    normalizePost.assignedAt = post.assignedAt;
  }
  return normalizedPost;
};

export const normalizePost: (post: SelectPostPayload) => PostExtended = (
  post
) => {
  const normalizedPost: PostExtended = normalize(post);

  return normalizedPost;
};

export const normalizePosts = (posts: SelectPostPayload[]) => {
  const normalizedPost:
    | PostExtended[]
    | (PostExtended[] | { assignedAt: Date })[] = posts.map((post) =>
    normalize(post)
  );

  return normalizedPost;
};
