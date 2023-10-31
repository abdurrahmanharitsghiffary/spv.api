import { body } from "express-validator";

const getValidateMessage = (type: string) =>
  `Invalid value provided. expected ${type}`;
const getMissingMessage = (field: string) => `Missing field ${field}`;

export const checkBody = (
  field: string,
  type: "isString" | "isBoolean" | "isInt",
  optional?: boolean
) => {
  if (optional) {
    return body(field)
      [type]()
      .withMessage(
        getValidateMessage(
          type === "isInt" ? "number" : type.slice(2).toLowerCase()
        )
      )
      .optional();
  }
  return body(field)
    [type]()
    .withMessage(
      getValidateMessage(
        type === "isInt" ? "number" : type.slice(2).toLowerCase()
      )
    )
    .exists()
    .withMessage(getMissingMessage(field));
};
