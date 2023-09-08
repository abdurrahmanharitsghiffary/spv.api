import express from "express";
import { RequestError } from "../types/error";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FieldError } from "../lib/error";

export const error = async (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log(err);
  console.error(err.name);
  switch (err.name) {
    case "RequestError": {
      if (err.statusCode > 499) {
        return res.status(err.statusCode).json({
          status: "error",
          message: err.message,
        });
      }
      return res.status(err.statusCode).json({
        status: "fail",
        data: {
          message: err.message,
        },
      });
    }
    case "JsendFailError": {
      return res.status(err.statusCode).json({
        status: "fail",
        data: { message: err.message },
      });
    }
    case "JsendError": {
      return res.status(err.statusCode).json({
        status: "error",
        message: err.message,
      });
    }
    case "JsonWebTokenError": {
      return res.status(401).json({
        status: "fail",
        data: {
          message: err.message,
        },
      });
    }
    case "TokenExpiredError": {
      return res.status(401).json({
        status: "fail",
        data: {
          message: "Access token expired",
        },
      });
    }
    case "FieldError": {
      const error = err as FieldError;
      return res.status(error.statusCode).json({
        status: "fail",
        data: {
          errors: error.errors,
          name: error.name,
        },
      });
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
          }
        }
        case "P2003": {
          if (err.message.includes("Invalid `PostLike.create()`")) {
            return res.status(404).json({
              status: "fail",
              data: {
                message: `Post not found`,
              },
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
              status: "fail",
              data: {
                message: `Not found!, Can't found post or comment`,
              },
            });
        }
        case "P2025": {
          if (err.message.includes("const createdFollow")) {
            return res.status(404).json({
              status: "fail",
              data: {
                message: `User not found`,
              },
            });
          }
        }
      }
    }
    case "PrismaClientValidationError": {
      if (err.message.includes("Argument `id` is missing")) {
        return res.status(422).json({
          status: "fail",
          data: {
            message: "Invalid provided id",
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
      if (err.statusCode >= 500)
        return res.status(err?.statusCode ?? 500).json({
          status: "error",
          message: err.message ?? "Something went wrong!",
        });
      return res.status(err?.statusCode).json({
        status: "fail",
        data: {
          message: err.message,
        },
      });
    }
  }
};
