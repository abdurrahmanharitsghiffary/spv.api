import { RequestError } from "../../lib/error";
import { NotFound } from "../../lib/messages";
import { excludeBlockedUser, excludeBlockingUser } from "../../lib/query/user";
import Post from "../../models/post.models";
export const findPostIsLiked = async (pId: number, uId: number) => {
  const post = await Post.findUnique({
    where: {
      id: pId,
      author: {
        AND: [
          {
            ...excludeBlockedUser(uId),
            ...excludeBlockingUser(uId),
          },
        ],
      },
    },
    select: {
      likes: {
        select: { userId: true },
        where: {
          userId: uId,
        },
      },
    },
  });

  if (!post) throw new RequestError(NotFound.POST, 404);
  return post;
};
