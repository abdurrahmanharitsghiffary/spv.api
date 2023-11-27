import JWT, { JwtPayload } from "jsonwebtoken";
import express from "express";
import User from "../models/user.models";
import { ExpressRequestExtended } from "../types/request";
import { tryCatchMiddleware } from "./handler.middlewares";
import { ForbiddenError, RequestError, UnauthorizedError } from "../lib/error";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../lib/consts";

export const verifyTokenOptional = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decode = await JWT.verify(token, ACCESS_TOKEN_SECRET as string);

      (req as ExpressRequestExtended).userEmail = (decode as JwtPayload).email;
      (req as ExpressRequestExtended).userId = (decode as JwtPayload).id;
      const isUserExist = await User.findUnique({
        where: {
          email: (decode as JwtPayload).email,
        },
      });
      if (!isUserExist) throw new UnauthorizedError();
      (req as ExpressRequestExtended).role = isUserExist.role;
      return next();
    } else {
      return next();
    }
  }
);

export const verifyToken = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) throw new RequestError("No token provided!", 401);
    const decode = await JWT.verify(token, ACCESS_TOKEN_SECRET as string);

    console.log(decode, " decode");
    (req as ExpressRequestExtended).userEmail = (decode as JwtPayload).email;
    (req as ExpressRequestExtended).userId = (decode as JwtPayload).id;
    const isUserExist = await User.findUnique({
      where: {
        email: (decode as JwtPayload).email,
      },
    });
    if (!isUserExist) throw new UnauthorizedError();
    (req as ExpressRequestExtended).role = isUserExist.role;
    next();
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

export const verifyRefreshToken = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.cookies["x.spv.session"];
    console.log(token, " token from server");
    // console.log(req.headers, " req headers");
    if (!token) throw new RequestError("You are unauthenticated!", 401);

    // const tokenIsExist = await RefreshToken.findUnique({
    //   where: {
    //     refreshToken: token,
    //   },
    // });

    // if (!tokenIsExist) throw new RequestError("Invalid refresh token", 401);

    const decodedToken = await JWT.verify(
      token,
      REFRESH_TOKEN_SECRET as string
    );

    (req as ExpressRequestExtended).userEmail = (
      decodedToken as JwtPayload
    ).email;

    next();
  }
);
