export type PagingObject<T> = {
  [key: "comments" | "posts" | "results" | "users"]: T;
  prev: null | string;
  next: null | string;
  limit: number;
  offset: number;
};
