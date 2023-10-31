import express from "express";
import { validationResult as validatorResult } from "express-validator";
import { ValidationError } from "../lib/error";
export const validationResult = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const result = await validatorResult(req);
    if (!result.isEmpty()) throw new ValidationError(result.array());
    return next();
  } catch (err) {
    next(err);
  }
};
