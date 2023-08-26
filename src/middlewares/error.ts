import express from "express";
import { RequestError } from "../types/error";

export const error = async (
  err: RequestError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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
      });
    }
    case "TokenExpiredError": {
      return res.status(401).json({
        status: "failed",
        statusCode: 401,
        message: err.message,
      });
    }
    default: {
      return res.status(500).json({
        status: "failed",
        statusCode: 500,
        message: err.message ?? "Something went wrong!",
      });
    }
  }
};
