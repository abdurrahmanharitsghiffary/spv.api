import prisma from "../config/prismaClient";
const Token = prisma.token;
export const RefreshToken = prisma.refreshToken;

export default Token;
