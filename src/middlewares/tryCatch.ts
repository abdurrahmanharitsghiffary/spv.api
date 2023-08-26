import express from "express";
export const tryCatch =
  (
    controller: (
      req: express.Request,
      res: express.Response,
      next?: express.NextFunction
    ) => void
  ) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await controller(req, res);
    } catch (err) {
      next(err);
    }
  };

export const tryCatchMiddleware =
  (
    middleware: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => void
  ) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await middleware(req, res, next);
    } catch (err) {
      next(err);
    }
  };
