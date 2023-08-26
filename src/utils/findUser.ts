import User from "../models/user";

const userSelectPublic = {
  id: true,
  username: true,
  profile: {
    select: { profileDescription: true, image: true },
  },
};

const userSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: { profileDescription: true, image: true },
  },
};

export const findUserPublic = async (id: string) => {
  const user = await User.findUnique({
    where: { id: Number(id) },
    select: userSelectPublic,
  });

  return user;
};

export const findUser = async (email: string) => {
  const user = await User.findUnique({
    where: {
      email,
    },
    select: userSelect,
  });

  return user;
};

export const findUserById = async (id: string) => {
  const user = await User.findUnique({
    where: {
      id: Number(id),
    },
    select: userSelect,
  });

  return user;
};

export const findAllUser = async () => {
  const users = await User.findMany({ select: userSelect });
  return users;
};
