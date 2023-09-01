import { Comment } from "../types/comment";
import { PostExtended } from "../types/post";
import { PagingObject } from "../types/response";
import { UserAccount } from "../types/user";

const getPrevUrl = ({
  offset,
  limit,
  path,
}: {
  offset: number;
  limit: number;
  path: string;
}): string | null =>
  offset - limit < 0
    ? offset === 0
      ? null
      : `${path}?offset=0&limit=${limit}`
    : `${path}?offset=${offset - limit}&limit=${limit}`;

const getNextUrl = ({
  offset,
  limit,
  path,
}: {
  offset: number;
  limit: number;
  path: string;
}): string => `${path}?offset=${offset + limit}&limit=${limit}`;

export const getPagingObject = ({
  offset = 0,
  limit = 20,
  data,
  path,
  dataKey = "results",
}: {
  offset?: number;
  limit?: number;
  data: PostExtended[] | Comment[] | UserAccount[];
  path: string;
  dataKey?: "comments" | "posts" | "results" | "users";
}): PagingObject<PostExtended[] | Comment[] | UserAccount[]> => {
  return {
    [dataKey]: data,
    next: getNextUrl({ path, limit, offset }),
    prev: getPrevUrl({ path, limit, offset }),
    offset,
    limit,
  };
};
