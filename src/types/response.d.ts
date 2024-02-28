export type ApiResponseT<T> = {
  success: boolean;
  message?: string;
  statusCode: number;
  data: T;
  errors?: any[] | undefined;
  name?: string;
};

export type ApiPagingObjectResponse<T> = {
  pagination: {
    previous: null | string;
    next: null | string;
    current: string;
    resultCount: number;
    totalRecords: number;
    limit: number;
    offset: number;
  };
} & ApiResponseT<T>;
