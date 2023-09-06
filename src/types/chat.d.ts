export type Chat = {
  id: number;
  message: string | null;
  image: {
    id: number;
    src: string;
  } | null;
  sender: {
    id: number;
    username: string;
  };
  receiver: {
    id: number;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
