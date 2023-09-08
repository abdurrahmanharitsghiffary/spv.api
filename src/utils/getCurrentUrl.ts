import express from "express";
import { baseUrl } from "../lib/baseUrl";
export const getCurrentUrl = (req: express.Request) =>
  new URL(req.originalUrl, baseUrl).href;
