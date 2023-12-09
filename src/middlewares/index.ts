import express from "express";
import { ApiError } from "../utils/response";
import { NotFound } from "../lib/messages";

export default function notFound(req: express.Request, res: express.Response) {
  return res.status(404).json(new ApiError(404, NotFound.ROUTE));
}
