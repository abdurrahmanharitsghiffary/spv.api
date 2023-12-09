export class RequestError extends Error {
  statusCode: number;
  errors?: any[];
  code?: string;
  constructor(
    message: string,
    statusCode: number,
    errors: any[] = [],
    code?: string
  ) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.name = "RequestError";

    if (code) this.code = code;
    if (errors?.length > 0) this.errors = errors;
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
