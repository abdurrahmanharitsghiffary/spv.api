import JWT from "jsonwebtoken";
import express from "express";
import User from "../models/user";
import { ExpressRequestExtended } from "../types/request";
import { tryCatchMiddleware } from "./tryCatch";
import { ForbiddenError, UnauthorizedError } from "../lib/error";

export const generateToken = async (payload: string | object | Buffer) => {
  const token = await JWT.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  return token;
};

export const verifyToken = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided!" });

    const decode = await JWT.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );

    if (typeof decode !== "string") {
      (req as ExpressRequestExtended).userEmail = decode.email;
      (req as ExpressRequestExtended).userId = decode.id;
      const isUserExist = await User.findUnique({
        where: {
          email: decode.email,
        },
      });
      if (!isUserExist) throw new UnauthorizedError();
      (req as ExpressRequestExtended).role = isUserExist.role;
      next();
    }
  }
);

export const isAdmin = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if ((req as ExpressRequestExtended).role === "admin") return next();
    throw new ForbiddenError();
  }
);
