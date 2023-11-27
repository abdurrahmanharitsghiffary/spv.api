export class ApiResponse {
  data: any;
  statusCode: number | undefined;
  success: boolean | undefined;
  message: string | undefined;
  constructor(data: unknown, statusCode: number, message?: string) {
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
    this.statusCode = statusCode;
  }
}

export class ApiError {
  data: any;
  statusCode: number | undefined;
  errors?: any[] | undefined;
  success: boolean | undefined;
  message: string | undefined;
  name?: string | undefined;
  constructor(
    statusCode: number,
    message: string,
    errors?: any[],
    name?: string
  ) {
    this.message = message;
    this.data = null;
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    if ((errors ?? []).length > 0) {
      this.errors = errors;
    }
    if (name && name !== "RequestError") {
      this.name = name;
    }
  }
}
