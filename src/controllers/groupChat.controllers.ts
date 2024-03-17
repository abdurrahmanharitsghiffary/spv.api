import express from "express";
import { createChatRoom, isChatRoomFound } from "../utils/chat/chatRoom.utils";
import {
  ExpressRequestExtended,
  ExpressRequestProtectedGroup,
} from "../types/request";
import { ApiResponse } from "../utils/response";
import { ChatRoom, ChatRoomParticipant } from "../models/chat.models";
import {
  selectChatRoom,
  selectChatRoomPWL,
  selectRoomParticipant,
} from "../lib/query/chat";
import { selectUserSimplified } from "../lib/query/user";
import { emitSocketEvent } from "../socket/socket.utils";
import { Socket_Event } from "../socket/event";
import { normalizeChatRooms } from "../utils/chat/chatRoom.normalize";
import { ForbiddenError, RequestError } from "../lib/error";
import Image from "../models/image.models";
import { checkParticipants } from "../utils";
import { ParticipantsField } from "../types/chat";
import { NotFound } from "../lib/messages";
import { normalizeChatParticipant } from "../utils/chat/chat.normalize";
import { Socket_Id, errorsMessage } from "../lib/consts";
import cloudinary, { getCloudinaryImage } from "../lib/cloudinary";
import ApplicationRequest from "../models/apply.models";
import { selectGroupMembershipRequest } from "../lib/query/app-request";
import { getPagingObject, parsePaging } from "../utils/paging";
import { notify } from "../utils/notification/notification.utils";
import { normalizeMembershipRequest } from "../utils/app-request/app-request.normalize";
import { findNotUserRoleParticipant } from "../utils/participants.utils";

export const createGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { participants, description, title, applyType, groupVisibility } =
    req.body;
  const imageSrc = getCloudinaryImage(req)?.[0];
  const uId = Number(userId);
  const createdGroupChat = await createChatRoom({
    isGroupChat: true,
    applyType,
    visibility: groupVisibility,
    participants: participants,
    currentUserId: uId,
    description,
    title,
    imageSrc: imageSrc as string,
  });

  createdGroupChat.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.id, "USER"),
      Socket_Event.JOIN_ROOM,
      createdGroupChat
    );
  });

  return res
    .status(201)
    .json(
      new ApiResponse(createdGroupChat, 201, "Group chat created successfully.")
    );
};

export const joinGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;
  const { userId } = req as ExpressRequestExtended;
  const gId = Number(groupId);
  const uId = Number(userId);

  const cht = await isChatRoomFound({
    customMessage: {
      message: NotFound.GROUP_CHAT,
      statusCode: 404,
    },
    chatRoomId: gId,
    currentUserId: uId,
  });

  if (cht.applyType === "private")
    throw new RequestError(
      "You must send application request to join this group.",
      403
    );

  const participant = await ChatRoomParticipant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: gId,
        userId: uId,
      },
    },
  });

  if (participant) {
    throw new RequestError(errorsMessage.ALREADY_JOIN_G, 409);
  }

  const joinedRoom = await ChatRoomParticipant.create({
    data: {
      chatRoomId: gId,
      userId: uId,
      role: "user",
    },
    select: {
      role: true,
      user: {
        select: selectUserSimplified,
      },
      chatRoomId: true,
      createdAt: true,
      chatRoom: { select: selectChatRoomPWL(uId) },
    },
  });

  const normalizedRoom = await normalizeChatRooms(joinedRoom.chatRoom);
  joinedRoom.chatRoom.participants.forEach(async (participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.user.id, "USER"),
      Socket_Event.JOIN_ROOM,
      normalizedRoom
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Successfully join into the group chat."));
};

export const leaveGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;
  const { userId } = req as ExpressRequestExtended;
  const gId = Number(groupId);
  const uId = Number(userId);

  const group = await ChatRoom.findUnique({ where: { id: gId } });

  if (!group) throw new RequestError(NotFound.GROUP_CHAT, 404);

  const paticipatedMember = await ChatRoomParticipant.findUnique({
    where: {
      chatRoomId_userId: {
        userId: uId,
        chatRoomId: gId,
      },
    },
  });

  if (!paticipatedMember) {
    throw new RequestError("You are not participated in group.", 409);
  }

  const joinedRoom = await ChatRoomParticipant.delete({
    where: {
      chatRoomId_userId: {
        userId: paticipatedMember.userId,
        chatRoomId: gId,
      },
    },
    select: {
      role: true,
      user: {
        select: selectUserSimplified,
      },
      chatRoomId: true,
      createdAt: true,
      chatRoom: { select: selectChatRoomPWL(uId) },
    },
  });

  const normalizedRoom = await normalizeChatRooms(joinedRoom.chatRoom);
  joinedRoom.chatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.user.id, "USER"),
      Socket_Event.LEAVE_ROOM,
      { roomId: normalizedRoom.id, userId: uId }
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Successfully leave group chat."));
};

export const updateGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { groupId } = req.params;
  const imageSrc = getCloudinaryImage(req)?.[0];
  let { description, title, groupVisibility, applyType } = req.body;
  const gId = Number(groupId);
  const uId = Number(userId);
  const selectRoom = selectChatRoomPWL(uId);
  const updatedChatRoom = await ChatRoom.update({
    where: {
      id: gId,
      isGroupChat: true,
    },
    data: {
      groupVisibility,
      applyType: applyType,
      description,
      title,
    },
    select: {
      ...selectRoom,
      messages: {
        ...selectRoom.messages,
        take: 10,
      },
    },
  });

  if (imageSrc) {
    await Image.upsert({
      create: {
        src: imageSrc as string,
        groupId: updatedChatRoom.id,
      },
      where: {
        groupId: updatedChatRoom.id,
      },
      update: {
        src: imageSrc as string,
      },
    });

    if (updatedChatRoom.groupPicture?.src) {
      await cloudinary.uploader.destroy(updatedChatRoom.groupPicture?.src);
    }
  }

  const normalizedRoom = await normalizeChatRooms(updatedChatRoom);

  updatedChatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.user.id, "USER"),
      Socket_Event.UPDATE_ROOM,
      {
        data: normalizedRoom,
      }
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Chat room successfully updated."));
};

export const deleteGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { groupId } = req.params;
  const uId = Number(userId);
  const gId = Number(groupId);

  const deletedRoom = await ChatRoom.delete({
    where: {
      id: gId,
      isGroupChat: true,
    },
    include: {
      participants: {
        select: { userId: true },
      },
      groupPicture: {
        select: {
          src: true,
        },
      },
    },
  });

  if (deletedRoom.groupPicture?.src) {
    await cloudinary.uploader.destroy(deletedRoom.groupPicture.src);
  }

  deletedRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.userId, "USER"),
      Socket_Event.DELETE_ROOM,
      deletedRoom.id
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Chat room successfully deleted."));
};

export const updateGroupChatParticipants = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;
  const { participants } = req.body;
  const { userRole, userId } = req as ExpressRequestProtectedGroup &
    ExpressRequestExtended;
  const gId = Number(groupId);
  const uId = Number(userId);

  await checkParticipants({
    participants,
    groupId: gId,
    currentUserId: uId,
  });
  const updatedGroupChat = await ChatRoom.update({
    where: {
      id: gId,
    },
    data: {
      participants: {
        update: [
          ...(participants as ParticipantsField).map((item) => ({
            // create: {
            //   role: item.role,
            //   userId: item.id,
            // },
            data: {
              role: item.role,
            },
            where: {
              chatRoomId_userId: {
                chatRoomId: gId,
                userId: item.id,
              },
            },
          })),
        ],
      },
    },
    select: {
      participants: {
        select: {
          userId: true,
        },
      },
    },
  });

  const updatedParticipants = await ChatRoomParticipant.findMany({
    where: {
      chatRoomId: gId,
      userId: { in: (participants as ParticipantsField).map((p) => p.id) },
    },
    select: {
      ...selectRoomParticipant,
    },
  });

  const normalizedParticipants = await Promise.all(
    updatedParticipants.map((participant) =>
      Promise.resolve(normalizeChatParticipant(participant))
    )
  );

  updatedGroupChat.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.userId, "USER"),
      Socket_Event.UPDATE_PARTICIPANTS,
      {
        roomId: gId,
        data: normalizedParticipants,
      }
    );
  });

  return res
    .status(204)
    .json(
      new ApiResponse(
        null,
        204,
        "Participants successfully added into the group."
      )
    );
};

export const deleteGroupParticipants = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;
  const { userRole, userId } = req as ExpressRequestProtectedGroup &
    ExpressRequestExtended;
  const { ids } = req.body;
  const gId = Number(groupId);
  const uId = Number(userId);

  await checkParticipants({
    participants: ids,
    groupId: gId,
    currentUserId: uId,
    isDeleting: true,
  });

  const chatRoomAfterDeletingParticipants = await ChatRoom.update({
    where: {
      id: gId,
    },
    data: {
      participants: {
        deleteMany: [...(ids as number[]).map((id) => ({ userId: id }))],
      },
    },
    select: {
      participants: {
        select: {
          userId: true,
        },
      },
    },
  });

  chatRoomAfterDeletingParticipants.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.userId, "USER"),
      Socket_Event.DELETE_PARTICIPANTS,
      {
        roomId: gId,
        data: ids,
      }
    );
  });

  return res
    .status(204)
    .json(
      new ApiResponse(
        null,
        204,
        "Participants successfully removed from the group."
      )
    );
};

export const addGroupParticipants = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, userRole } = req as ExpressRequestExtended &
    ExpressRequestProtectedGroup;
  const { groupId } = req.params;
  const { ids } = req.body;
  const userIds: number[] = ids;
  const uId = Number(userId);
  const gId = Number(groupId);

  await checkParticipants({
    participants: ids,
    groupId: gId,
    currentUserId: uId,
  });

  const updatedGroup = await ChatRoom.update({
    where: { isGroupChat: true, id: gId },
    data: {
      participants: {
        createMany: {
          skipDuplicates: true,
          data: userIds.map((id) => ({ role: "user", userId: id })),
        },
      },
    },
    select: selectChatRoom(uId),
  });

  const chatParticipants = await ChatRoomParticipant.findMany({
    where: { chatRoomId: gId },
    select: {
      userId: true,
    },
  });

  const newParticipants = await ChatRoomParticipant.findMany({
    where: { chatRoomId: gId, userId: { in: userIds } },
    select: { ...selectRoomParticipant },
  });
  const normalizedNewParticipants = await Promise.all(
    newParticipants.map(async (p) => await normalizeChatParticipant(p))
  );

  chatParticipants.forEach((p) => {
    emitSocketEvent(
      req,
      Socket_Id(p.userId, "USER"),
      Socket_Event.ADD_PARTICIPANTS,
      { roomId: gId, data: normalizedNewParticipants }
    );
  });

  return res
    .status(201)
    .json(
      new ApiResponse(updatedGroup, 201, "Successfully added users to group.")
    );
};

export const requestGroupChatApplication = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;
  const { comment } = req.body;
  const { userId } = req as ExpressRequestExtended;
  const gId = Number(groupId);
  const uId = Number(userId);

  const cht = await isChatRoomFound({ chatRoomId: gId, currentUserId: uId });

  if (cht?.applyType !== "private")
    throw new RequestError(
      "This group allows you to join without sending membership request.",
      400
    );

  const participant = await ChatRoomParticipant.findUnique({
    where: { chatRoomId_userId: { chatRoomId: gId, userId: uId } },
    select: { userId: true },
  });

  if (participant?.userId)
    throw new RequestError("You already participated in this group.", 409);

  const pendingRequest = await ApplicationRequest.findFirst({
    where: { groupId: gId, userId: uId, status: "PENDING" },
  });

  if (pendingRequest) {
    throw new RequestError(
      "You already have a pending membership request. Please wait until the request is either approved or rejected.",
      409
    );
  }

  const notUserRoleParticipants = await findNotUserRoleParticipant(gId, uId);

  const applyRequest = await ApplicationRequest.create({
    data: { groupId: gId, userId: uId, type: "group_chat", comment },
    select: {
      ...selectGroupMembershipRequest,
    },
  });

  const normalizedAprq = await normalizeMembershipRequest(applyRequest);

  notUserRoleParticipants.forEach((p) => {
    emitSocketEvent(
      req,
      Socket_Id(p.userId, "USER"),
      Socket_Event.RECEIVE_GAR,
      { data: normalizedAprq, roomId: gId, userId: p.userId }
    );
  });

  return res
    .status(201)
    .json(
      new ApiResponse(normalizedAprq, 201, "Membership request has been sent.")
    );
};

export const getGroupChatApplicationRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const { limit, offset } = parsePaging(req);
  const { type } = req.query;
  const { groupId } = req.params;
  const gId = Number(groupId);
  const statusFilter =
    type === "all" ? undefined : (type?.toString().toUpperCase() as any);

  const appRequests = await ApplicationRequest.findMany({
    where: { groupId: gId, type: "group_chat", status: statusFilter },
    select: { ...selectGroupMembershipRequest },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: limit,
    skip: offset,
  });

  const normalizedRequests = await Promise.all(
    appRequests.map((r) => Promise.resolve(normalizeMembershipRequest(r)))
  );

  const total = await ApplicationRequest.count({
    where: { groupId: gId, type: "group_chat", status: statusFilter },
  });

  return res.status(200).json(
    await getPagingObject({
      req,
      data: normalizedRequests,
      total_records: total,
    })
  );
};

export const approveGroupChatApplicationRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { groupId, requestId } = req.params;
  const gId = Number(groupId);
  const uId = Number(userId);
  const rId = Number(requestId);

  const apRq = await ApplicationRequest.findUnique({
    where: {
      id: rId,
      type: "group_chat",
    },
  });

  const chatParticipants = await ChatRoomParticipant.findMany({
    where: { chatRoomId: gId },
    select: { userId: true },
  });

  const notRoleUserParticipants = await findNotUserRoleParticipant(gId, uId);

  if (!apRq) throw new RequestError(NotFound.APRQ, 404);

  const p = await ChatRoomParticipant.findUnique({
    where: { chatRoomId_userId: { chatRoomId: gId, userId: apRq.userId } },
  });

  if (p) throw new RequestError("User already a member of this group.", 409);

  if (apRq.status === "APPROVED")
    throw new RequestError(errorsMessage.APRQ_ALREADY_A, 409);
  if (apRq.status === "REJECTED")
    throw new RequestError(errorsMessage.APRQ_ALREADY_R, 409);

  const newParticipant = await ChatRoomParticipant.create({
    data: { role: "user", userId: apRq.userId, chatRoomId: gId },
    select: { ...selectRoomParticipant },
  });
  const normalizedNewParticipant = await normalizeChatParticipant(
    newParticipant
  );
  await ApplicationRequest.update({
    where: {
      id: rId,
      type: "group_chat",
    },
    data: { status: "APPROVED" },
  });

  notRoleUserParticipants.forEach((p) => {
    emitSocketEvent(
      req,
      Socket_Id(p.userId, "USER"),
      Socket_Event.APPROVE_GAR,
      {
        requestId: rId,
        roomId: gId,
      }
    );
  });

  chatParticipants.forEach((p) => {
    emitSocketEvent(
      req,
      Socket_Id(p.userId, "USER"),
      Socket_Event.ADD_PARTICIPANTS,
      { roomId: gId, data: [normalizedNewParticipant] }
    );
  });

  await notify(req, {
    groupId: gId,
    type: "accepted_group_application",
    receiverId: apRq.userId,
    userId: uId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(null, 200, "User successfully added into the group.")
    );
};

export const rejectGroupChatApplicationRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { groupId, requestId } = req.params;
  const gId = Number(groupId);
  const uId = Number(userId);
  const rId = Number(requestId);

  const apRq = await ApplicationRequest.findUnique({
    where: {
      id: rId,
      type: "group_chat",
    },
  });
  if (!apRq) throw new RequestError(NotFound.APRQ, 404);

  if (apRq.status === "APPROVED")
    throw new RequestError(errorsMessage.APRQ_ALREADY_A, 409);
  if (apRq.status === "REJECTED")
    throw new RequestError(errorsMessage.APRQ_ALREADY_R, 409);

  await ApplicationRequest.update({
    where: {
      id: rId,
      type: "group_chat",
    },
    data: { status: "REJECTED" },
  });

  const notUserRoleParticipants = await findNotUserRoleParticipant(gId, uId);

  notUserRoleParticipants.forEach((p) => {
    emitSocketEvent(req, Socket_Id(p.userId, "USER"), Socket_Event.REJECT_GAR, {
      requestId: rId,
      roomId: gId,
    });
  });

  await notify(req, {
    groupId: gId,
    type: "rejected_group_application",
    receiverId: apRq.userId,
    userId: uId,
  });

  return res
    .status(204)
    .json(
      new ApiResponse(null, 204, "Successfully rejected application request.")
    );
};

export const getMembershipRequests = async (
  req: express.Request,
  res: express.Response
) => {
  const { type } = req.query;
  const status = type === "all" ? undefined : type?.toString().toUpperCase();
  const { limit, offset } = parsePaging(req);
  const { userId } = req as ExpressRequestExtended;
  const uId = Number(userId);
  const appRequests = await ApplicationRequest.findMany({
    where: {
      userId: uId,
      type: "group_chat",
      status: status as any,
    },
    orderBy: [
      {
        status: "asc",
      },
      { createdAt: "desc" },
    ],
    select: { ...selectGroupMembershipRequest },
    take: limit,
    skip: offset,
  });
  const total = await ApplicationRequest.count({
    where: {
      userId: uId,
      type: "group_chat",
      status: status as any,
    },
  });

  const normalizedAprq = await Promise.all(
    appRequests.map((ap) => Promise.resolve(normalizeMembershipRequest(ap)))
  );

  return res
    .status(200)
    .json(
      await getPagingObject({ req, data: normalizedAprq, total_records: total })
    );
};

export const deleteMembershipRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const { requestId } = req.params;
  const { userId } = req as ExpressRequestExtended;
  const uId = Number(userId);
  const rId = Number(requestId);

  const apRq = await ApplicationRequest.findUnique({
    where: { id: rId, AND: [{ user: { id: uId } }] },
    select: { groupId: true },
  });

  if (!apRq) throw new RequestError("Group membership request not found.", 404);

  await ApplicationRequest.delete({
    where: { id: rId, AND: [{ user: { id: uId } }] },
  });

  const notUserRoleParticipants = await findNotUserRoleParticipant(
    apRq.groupId,
    uId
  );

  const s = new Set(notUserRoleParticipants.map((n) => n.userId));
  s.add(uId);
  console.log(s, "SSSEEETTTTTANNN");
  Array.from(s).forEach((p) => {
    emitSocketEvent(req, Socket_Id(p, "USER"), Socket_Event.DELETE_GAR, {
      roomId: apRq.groupId,
      requestId: rId,
    });
  });

  return res.status(204).json(new ApiResponse(null, 204));
};

export const getGroupMembershipRequestById = async (
  req: express.Request,
  res: express.Response
) => {
  const { requestId } = req.params;
  const { userId } = req as ExpressRequestExtended;
  const rId = Number(requestId);
  const uId = Number(userId);
  const membershipRequest = await ApplicationRequest.findUnique({
    where: {
      id: rId,
      userId: uId,
    },
    select: selectGroupMembershipRequest,
  });

  if (!membershipRequest) throw new RequestError(NotFound.MR, 404);
  if (membershipRequest.user.id !== uId) throw new ForbiddenError();

  const normalizedRequest = await normalizeMembershipRequest(membershipRequest);

  return res.status(200).json(new ApiResponse(normalizedRequest, 200));
};
