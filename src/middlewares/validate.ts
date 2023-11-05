import express from "express";
import { AnyZodObject, ZodRawShape, z, ZodTypeAny } from "zod";
import { zIntOrStringId, zLimit, zOffset } from "../schema";

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

export const validateBody =
  (schema: AnyZodObject | ZodTypeAny) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await (z.object({ body: schema }) as z.infer<typeof schema>).parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      next(error);
    }
  };

export const validateParams =
  (schema: AnyZodObject) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await (z.object({ params: schema }) as z.infer<typeof schema>).parseAsync(
        {
          body: req.body,
          query: req.query,
          params: req.params,
        }
      );
      return next();
    } catch (error) {
      next(error);
    }
  };

export const validateParamsV2 =
  (key: string) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await z
        .object({
          params: z.object({
            [key]: zIntOrStringId,
          }),
        })
        .parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      return next();
    } catch (error) {
      next(error);
    }
  };

export const validatePagingOptions = validate(
  z.object({
    query: z.object({
      limit: zLimit,
      offset: zOffset,
    }),
  })
);

export const validatePagingOptionsExtend = (object?: ZodRawShape) => {
  let schema = z.object({
    query: z.object({
      limit: zLimit,
      offset: zOffset,
    }),
  });

  if (object) {
    schema.extend(object);
  }

  return validate(schema);
};
