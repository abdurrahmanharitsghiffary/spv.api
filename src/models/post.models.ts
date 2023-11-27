import prisma from "../config/prismaClient";
const Post = prisma.post;
export const PostLike = prisma.postLike;
export default Post;
