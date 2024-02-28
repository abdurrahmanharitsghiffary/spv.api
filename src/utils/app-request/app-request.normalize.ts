import {
  SelectGroupMembershipRequestPayload,
  SelectAppRequestPayload,
} from "../../lib/query/app-request";
import { AppRequest, MembershipRequest } from "../../types/app-request";
import { simplifyUser } from "../user/user.normalize";

export const normalizeAppRequest = async (
  payload: SelectAppRequestPayload
): Promise<AppRequest> => {
  return Promise.resolve({
    id: payload.id,
    sender: await simplifyUser(payload.user),
    comment: payload.comment,
    status: payload.status,
    createdAt: payload.createdAt,
    type: payload.type,
    updatedAt: payload.updatedAt,
  });
};

export const normalizeMembershipRequest = async (
  payload: SelectGroupMembershipRequestPayload
): Promise<MembershipRequest> => {
  return Promise.resolve({
    id: payload.id,
    sender: await simplifyUser(payload.user),
    comment: payload.comment,
    status: payload.status,
    createdAt: payload.createdAt,
    type: payload.type,
    groupId: payload.groupId,
    updatedAt: payload.updatedAt,
  });
};
