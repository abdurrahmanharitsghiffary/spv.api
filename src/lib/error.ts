export class RequestError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.name = "RequestError";
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;
  constructor() {
    super();
    this.statusCode = 401;
    this.message = "Unauthorized";
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  statusCode: number;
  constructor() {
    super();
    this.statusCode = 403;
    this.message = "Access Denied";
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends Error {
  statusCode: number;
  status: string;
  data: any;
  constructor(errors: any) {
    super();
    this.status = "fail";
    this.statusCode = 422;
    this.data = errors;
    this.name = "ValidationError";
  }
}

export class FieldError extends Error {
  statusCode: number;
  errors: { field: string; code: string }[];
  constructor(fields: { key: string; code: string }[]) {
    super();
    this.errors = fields.map((field) => ({
      field: field.key,
      code: field.code,
    }));
    this.statusCode = 422;
    this.name = "FieldError";
  }
}

export type FieldErrorTypeOptions =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "object"
  | "function"
  | "array";

export interface FieldErrorOptions {
  field: any;
  key: string;
  type?: FieldErrorTypeOptions;
}

export const fieldsErrorTrigger = (
  fields: FieldErrorOptions[]
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const errors: { key: string; code: string }[] = [];

    if (fields.some(({ field }) => field === undefined)) {
      fields
        .filter(({ field }) => field === undefined)
        .forEach((field) =>
          errors.push({ key: field.key, code: "missing_field" })
        );
    } else if (
      fields.some((field) => {
        if (field.type === undefined) return false;
        // else if (field.type === "number" && Number(field.field) ) return
        if (
          field.type === "array"
            ? !Array.isArray(field.field)
            : typeof field.field !== field.type
        ) {
          return true;
        }
      }) &&
      fields.every(({ field }) => field !== undefined)
    ) {
      fields
        .filter((field) =>
          field.type === "array"
            ? !Array.isArray(field.field)
            : typeof field.field !== field.type
        )
        .forEach((field) =>
          errors.push({
            key: field.key,
            code: `Invalid value provided. expected ${field.type} from ${field.key}`,
          })
        );
    }
    if (errors.length > 0) reject(new FieldError(errors));
    resolve();
  });
};

export class PagingLimitError extends Error {
  statusCode: number;
  constructor() {
    super();
    this.statusCode = 400;
    this.message = "Can't set limit above 50, max limit for pagination is 50";
    this.name = "PagingLimitError";
  }
}

export const limitErrorTrigger = (limit: number) => {
  if (limit > 50) throw new PagingLimitError();
  return;
};

export class JsendFailError extends RequestError {
  status: string;
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.status = "fail";
    this.name = "JsendFailError";
  }
}

export class JsendError extends RequestError {
  status: string;
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.status = "error";
    this.name = "JsendError";
  }
}
