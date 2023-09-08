import express from "express";

export default function notFound(req: express.Request, res: express.Response) {
  return res.status(404).json({
    status: "fail",
    data: {
      message: "Route not found",
    },
  });
}
