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
