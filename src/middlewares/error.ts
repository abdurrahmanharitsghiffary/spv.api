import express from "express";
import { RequestError } from "../types/error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { MissingFieldError } from "../lib/error";

export const error = async (
  err: RequestError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log(err);
  console.error(err.name);
  switch (err.name) {
    case "RequestError": {
      return res.status(err.statusCode ?? 500).json({
        status: "failed",
        statusCode: err.statusCode ?? 500,
        message: err.message ?? "Something went wrong!",
      });
    }
    case "JsonWebTokenError": {
      return res.status(401).json({
        status: "failed",
        statusCode: 401,
        message: err.message,
        name: err.name,
      });
    }
    case "TokenExpiredError": {
      return res.status(401).json({
        status: "failed",
        statusCode: 401,
        message: err.message,
        name: err.name,
      });
    }
    case "MissingFieldError": {
      const error = err as MissingFieldError;
      return res
        .status(error.statusCode)
        .json({
          message: error.message,
          errors: error.errors,
          name: error.name,
        });
    }
    case "PrismaClientKnownRequestError": {
      switch ((err as RequestError & PrismaClientKnownRequestError).code) {
        case "P2002": {
          if (err.message.includes("Invalid `PostLike.create()`")) {
            return res.status(404).json({
              status: "failed",
              statusCode: 404,
              message: `Post not found`,
            });
          }
        }
        case "P2003": {
          if (err.message.includes("Invalid `PostLike.create()`")) {
            return res.status(404).json({
              status: "failed",
              statusCode: 404,
              message: `Post not found`,
            });
          }
          if (
            [
              "Invalid `Post.update()`",
              "Invalid `Comment.update()`",
              "Invalid `Comment.create()`",
              "Invalid `Post.create()`",
            ].some((message) => err.message.includes(message))
          )
            return res.status(404).json({
              status: "failed",
              statusCode: 404,
              message: `Not found!, Can't found post or comment`,
            });
        }
        case "P2025": {
          if (err.message.includes("const createdFollow")) {
            return res.status(404).json({
              status: "failed",
              statusCode: 404,
              message: `User not found`,
            });
          }
        }
      }
    }
    case "PrismaClientValidationError": {
      return res.status(422).json({
        status: "failed",
        statusCode: 422,
        message:
          err.message
            .slice(err.message.indexOf("`content`:"))
            .split("`content`: ")[1] ??
          "Invalid value provided. Validation Error!",
      });
    }
    case "ZodError": {
      return res.status(422).json(err);
    }
    default: {
      return res.status(err?.statusCode ?? 500).json({
        status: "failed",
        statusCode: err?.statusCode ?? 500,
        message: err.message ?? "Something went wrong!",
      });
    }
  }
};
