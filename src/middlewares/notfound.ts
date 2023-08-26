import express from "express";

export default function notFound(req: express.Request, res: express.Response) {
  return res.status(404).send("Route not found");
}
