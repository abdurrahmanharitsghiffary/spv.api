import { SelectPostPayload } from "../lib/query/post";
import { Post, PostExtended } from "../types/post";

const normalize = (post: SelectPostPayload) => ({
  id: post?.id,
  title: post?.title,
  postContent: post?.content,
  media: post?.images,
  author: {
    id: post?.author.id,
    username: post?.author.username,
    profilePhoto: post?.author?.profile?.avatarImage ?? null,
  },
  likes: {
    likedBy: [...post.likes.map((like) => like.user.id)],
    total: post._count.likes ?? 0,
  },
  commentIds: [...post?.comments.map((comment) => comment.id)],
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
