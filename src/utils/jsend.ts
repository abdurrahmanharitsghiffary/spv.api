import { JsendError, JsendFail, JsendSuccess } from "../types/response";

export const jSuccess = (
  data: unknown | null,
  code?: number | string
): JsendSuccess<unknown | null> => {
  if (code) {
    return {
      status: "success",
      code,
      data: data ?? null,
    };
  }
  return {
    status: "success",
    data: data ?? null,
  };
};

export const jError = (message: string, code?: number): JsendError<string> => {
  if (!code)
    return {
      status: "error",
      message,
    };
  return {
    status: "error",
    message,
    code,
  };
};

export const jFail = (data: any): JsendFail<any> => {
  return {
    status: "fail",
    data,
  };
};
