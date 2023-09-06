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

export class MissingFieldError extends Error {
  statusCode: number;
  errors: { field: string; code: "missing_field" }[];
  constructor(fields: string[]) {
    super();
    this.message = `Missing required ${fields.length > 1 ? "fields" : "field"}`;
    this.errors = fields.map((field) => ({ field, code: "missing_field" }));
    this.statusCode = 422;
    this.name = "MissingFieldError";
  }
}

export const missingFieldsErrorTrigger = (
  fields: { field: any; key: string }[]
) => {
  if (fields.some((field) => !field.field)) {
    throw new MissingFieldError(
      fields.filter(({ field }) => !field).map((field) => field.key)
    );
  }
  return;
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
