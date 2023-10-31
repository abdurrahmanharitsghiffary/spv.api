import JWT from "jsonwebtoken";
export const generateRefreshToken = async (payload: string | object | Buffer) =>
  await JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });

export const generateAccessToken = async (payload: string | object | Buffer) =>
  await JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: 3600,
    // expiresIn: 1,
  });
