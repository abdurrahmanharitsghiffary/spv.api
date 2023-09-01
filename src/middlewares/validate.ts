import express from "express";
import { AnyZodObject, z } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await (schema as z.infer<typeof schema>).parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      next(error);
    }
  };
