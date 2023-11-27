import express from "express";
import { ApiError } from "../utils/response";

export default function notFound(req: express.Request, res: express.Response) {
  return res.status(404).json(new ApiError(404, "Route not found"));
}
