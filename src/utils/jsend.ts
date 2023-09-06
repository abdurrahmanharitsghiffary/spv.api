export const jSuccess = (data: unknown | null) => {
  return {
    status: "success",
    data,
  };
};

export const jError = (message: string, code?: number) => {
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

export const jFail = (data: any) => {
  return {
    status: "fail",
    data,
  };
};
