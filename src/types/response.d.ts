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
    result_count: number;
    total_records: number;
    limit: number;
    offset: number;
  };
} & ApiResponseT<T>;
