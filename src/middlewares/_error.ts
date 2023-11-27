import express from "express";
import { RequestError } from "../types/error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ApiError } from "../utils/response";

export const error = async (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error(err.name, " Error Name");
  console.log(err, " Error");
  switch (err.name) {
    case "RequestError": {
      return res
        .status(err.statusCode)
        .json(new ApiError(err.statusCode, err.message));
    }
    case "JsonWebTokenError": {
      return res.status(401).json(new ApiError(401, "Invalid token"));
    }
    case "TokenExpiredError": {
      return res.status(403).json(new ApiError(403, "Token expired"));
    }
    case "PrismaClientKnownRequestError": {
      switch ((err as RequestError & PrismaClientKnownRequestError).code) {
        case "P2002": {
          if (err.message.includes("Invalid `PostLike.create()`")) {
            return res.status(404).json({
              status: "fail",
              data: {
                message: `Post not found`,
              },
            });
          } else if (
            err.message.includes("Invalid `prisma.savedPost.create()`") &&
            err.message.includes(
              "Unique constraint failed on the constraint: `PRIMARY`"
            )
          ) {
            return res.status(409).json({
              status: "fail",
              data: {
                message: "You already saved this post",
              },
            });
          }
        }
        case "P2003": {
          if (
            err.message.includes("Invalid `Chat.create()`") &&
            err.message.includes("const createdChat")
          ) {
            return res.status(404).json({
              status: "fail",
              data: {
                message: `Recipient not found`,
              },
            });
          }
          if (err.message.includes("Invalid `PostLike.create()`")) {
            return res.status(404).json({
              status: "fail",
              data: {
                message: `Post not found`,
              },
            });
          }
        }
        case "P2025": {
          if (err.message.includes("const createdFollow")) {
            return res.status(404).json({
              status: "fail",
              data: {
                message: `User not found`,
              },
            });
          } else if (
            err.message.includes(
              "Foreign key constraint failed on the field: `postId`"
            )
          ) {
            return res.status(404).json({
              status: "fail",
              data: {
                message: "Can't found post with provided postId",
              },
            });
          } else if (
            err.message.includes(
              "Foreign key constraint failed on the field: `parentId`"
            )
          ) {
            return res.status(404).json({
              status: "fail",
              data: {
                message: "Can't found comment with provided parentId",
              },
            });
          }
          // return res.status(404).json({
          //   status: "fail",
          //   data: {
          //     message: "Record to delete does not exist.",
          //   },
          // });
        }
      }
    }
    case "PrismaClientValidationError": {
      if (
        err.message.includes("Argument `id` is missing") ||
        err.message.includes(
          "Unable to fit value 1e+23 into a 64-bit signed integer for field `id`"
        ) ||
        (err.message.includes("needs at least one of `id` arguments.") &&
          err.message.includes("Argument `where`"))
      ) {
        return res.status(422).json({
          status: "fail",
          data: {
            message:
              "Invalid provided id, expected Int number or numeric string, received NaN value",
          },
        });
      }
      return res.status(422).json({
        status: "fail",
        data: {
          message:
            err.message
              .slice(err.message.indexOf("`content`:"))
              .split("`content`: ")[1] ??
            "Invalid value provided. Validation Error!",
        },
      });
    }
    case "ZodError": {
      return res.status(422).json({
        status: "fail",
        data: {
          errors: err.issues,
          name: err.name,
        },
      });
    }
    default: {
      if (err?.statusCode >= 500)
        return res.status(err?.statusCode ?? 500).json({
          status: "error",
          message: err.message ?? "Something went wrong!",
        });
      return res.status(err?.statusCode ?? 500).json({
        status: "fail",
        data: {
          message: err.message,
        },
      });
    }
  }
};
