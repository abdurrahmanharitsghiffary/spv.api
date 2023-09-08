import { limitErrorTrigger } from "../lib/error";
import { Chat } from "../types/chat";
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
  total_records,
  current,
}: {
  offset?: number;
  limit?: number;
  data: PostExtended[] | Comment[] | UserAccount[] | Chat[];
  path: string;
  total_records: number;
  current: string;
}): PagingObject<PostExtended[] | Comment[] | UserAccount[] | Chat[]> => {
  limitErrorTrigger(limit);

  return {
    status: "success",
    data,
    pagination: {
      next: data.length < limit ? null : getNextUrl({ path, limit, offset }),
      previous: getPrevUrl({ path, limit, offset }),
      current,
      result_count: data.length,
      total_records,
      offset,
      limit,
    },
  };
};
// : `${path}${offset || limit ? "?" : ""}${
//   offset ? `offset=${offset}` : ""
// }${limit ? `limit=${limit}` : ""}`,
