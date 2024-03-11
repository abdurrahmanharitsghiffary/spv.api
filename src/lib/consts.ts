export const BASE_URL = process.env.BASE_WEB_URL;
export const BASE_CLIENT_URL = process.env.CLIENT_URL;
export const COOKIE_SECRET = process.env.COOKIE_SECRET;
export const PORT = process.env.PORT;
export const HOST = process.env.HOST;
export const BCRYPT_SALT = process.env.BCRYPT_SALT;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const errorsMessage = Object.freeze({
  FILE_TOO_BIG:
    "The file size exceeds the maximum allowed limit. Please upload a file that is equals to 300kb or fewer.",
  FILE_MIME_TYPE:
    "Invalid file mime types, accepted types: .jpg, .jpeg, .png, .webp",
  APRQ_ALREADY_R: "This membership request has already been rejected.",
  APRQ_ALREADY_A: "This membership request has already been approved.",
  ALREADY_JOIN_G: "You are already a member of this group.",
});

const SOCKET_ID = Object.freeze({
  ROOM: "chat_room_",
  USER: "u_",
});

export const Socket_Id = (id: number, types: keyof typeof SOCKET_ID) =>
  `${SOCKET_ID[types]}${id}`;
