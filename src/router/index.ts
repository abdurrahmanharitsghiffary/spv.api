import { Express } from "express";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import postRouter from "./post.routes";
import googleRouter from "./googleAuth.routes";
import messageRouter from "./messages.routes";
import commentRouter from "./comment.routes";
import meRouter from "./me.routes";
import accountRouter from "./account.routes";
import chatRouter from "./chat.routes";
import { refreshToken } from "../controllers/auth.controller";
import {
  verifyRefreshToken,
  verifyToken,
} from "../middlewares/auth.middlewares";
import { getSearchResults } from "../controllers/search.controllers";
import { tryCatch } from "../middlewares/handler.middlewares";
import { validate } from "../middlewares/validator.middlewares";
import { z } from "zod";
import { zLimit, zOffset } from "../schema";
import { uploadImageV2 } from "../middlewares/multer.middlewares";
import { uploadFilesToCloudinary } from "../middlewares/cloudinary.middleware";

export function router(app: Express) {
  app.use("/api/auth/google", googleRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/comments", commentRouter);
  app.use("/api/me", meRouter);
  app.use("/api/account", accountRouter);
  app.use("/api/chats", chatRouter);
  app.use("/api/messages", messageRouter);
  app.get(
    "/api/search",
    validate(
      z.object({
        query: z.object({
          limit: zLimit,
          offset: zOffset,
          type: z.enum(["post", "user", "all"]).optional(),
          q: z.string().optional(),
          filter: z.enum(["followed", "not_followed"]).optional(),
        }),
      })
    ),
    verifyToken,
    tryCatch(getSearchResults)
  );
  app.post("/api/refresh", verifyRefreshToken, refreshToken);
  // // 4500 - 5000ms
  // app.get("/test/endpoint", async (req, res) => {
  //   const users = await User.findMany({ select: selectUser });

  //   const normalizedUsers = await Promise.all(
  //     users.map((u) => normalizeUser(u))
  //   );

  //   res.status(200).json(normalizedUsers);
  // });
  // // 950 - 1200 ms
  // app.get("/test/endpoint2", async (req, res) => {
  //   const users = await User.findMany();

  //   res.status(200).json(users);
  // });
  // // 180++ ms
  // app.get("/test/endpoint3", async (req, res) => {
  //   res.status(200).json("lol");
  // });
  // // Error because normalizing invalid payload
  // app.get("/test/endpoint4", async (req, res) => {
  //   const users = await User.findMany();

  //   const normalizedUsers = await Promise.all(
  //     users.map((u) => normalizeUserPublic(u as any))
  //   );

  //   res.status(200).json(normalizedUsers);
  // });
  // // 970 - 1190 ms
  // app.get("/test/endpoint5", async (req, res) => {
  //   const users = await User.findMany();

  //   const normalizedUsers = await Promise.all(
  //     users.map((u) => simplifyUser(u as any))
  //   );

  //   res.status(200).json(normalizedUsers);
  // });
  // // 4500++ ms
  // app.get("/test/endpoint6", async (req, res) => {
  //   const users = await User.findMany({ select: selectUser });

  //   res.status(200).json(users);
  // });

  // // 4500 - 4700 ms
  // app.get("/test/ep", validatePagingOptions, async (req, res) => {
  //   const { limit = 20, offset = 0 } = parsePaging(req);
  //   const users = await User.findMany({
  //     skip: offset,
  //     take: limit,
  //     select: selectUser,
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });
  //   return res
  //     .status(200)
  //     .json(
  //       await getPagingObject({ data: users, total_records: users.length, req })
  //     );
  // });
  // // 980 - 1150 ms
  // app.get("/test/ep2", validatePagingOptions, async (req, res) => {
  //   const { limit = 20, offset = 0 } = parsePaging(req);
  //   const users = await User.findMany({
  //     skip: offset,
  //     take: limit,
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });
  //   return res
  //     .status(200)
  //     .json(
  //       await getPagingObject({ data: users, total_records: users.length, req })
  //     );
  // });
  // // 4450 - 4650 ms
  // app.get("/test/ep3", validatePagingOptions, async (req, res) => {
  //   const { limit = 20, offset = 0 } = parsePaging(req);
  //   const users = await User.findMany({
  //     skip: offset,
  //     take: limit,
  //     select: selectUser,
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });

  //   const normalizedUsers = await Promise.all(
  //     users.map((u) => Promise.resolve(normalizeUserPublic(u)))
  //   );

  //   return res.status(200).json(
  //     await getPagingObject({
  //       data: normalizedUsers,
  //       total_records: users.length,
  //       req,
  //     })
  //   );
  // });

  // app.get("/test/us", async (req, res) => {
  //   const users = await User.findMany({
  //     select: selectUserSimplified,
  //   });

  //   const normalized = await Promise.all(users.map((u) => simplifyUser(u)));
  //   return res.status(200).json(normalized);
  // });

  app.post(
    "/test/postimage",
    uploadImageV2.array("image"),
    uploadFilesToCloudinary,
    (req, res) => {
      return res.status(200).json("success");
    }
  );
}

// The main problem why the query is really slow is because inneficient selectUserQuery??
