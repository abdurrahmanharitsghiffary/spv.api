import { SelectPostPayload } from "../lib/query/post";
import { Post, PostExtended } from "../types/post";

const normalize = (post: SelectPostPayload): PostExtended => ({
  id: post?.id,
  title: post?.title,
  content: post?.content,
  images: post?.images,
  author: {
    id: post?.author.id,
    username: post?.author.username,
    image: post?.author?.profile?.avatarImage ?? null,
  },
  likes: {
    likedBy: post.likes.map(({ user: { id, profile, username } }) => ({
      id,
      username,
      image: profile?.avatarImage?.src
        ? { src: profile?.avatarImage?.src }
        : null,
    })),
    total: post._count.likes ?? 0,
  },
  comments: {
    commentIds: post.comments.map((comment) => comment.id),
    total: post._count.comments ?? 0,
  },
  updatedAt: post?.updatedAt,
  createdAt: post?.createdAt,
});

export const normalizePost: (post: SelectPostPayload) => Post = (post) => {
  const normalizedPost: PostExtended = normalize(post);

  return normalizedPost;
};

export const normalizePosts = (posts: SelectPostPayload[]) => {
  const normalizedPost: PostExtended[] = posts.map((post) => normalize(post));

  return normalizedPost;
};
