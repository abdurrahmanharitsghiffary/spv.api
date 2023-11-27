import prisma from "../config/prismaClient";

const Chat = prisma.chat;
const ChatRoom = prisma.chatRoom;
const ChatRoomParticipant = prisma.chatRoomParticipant;

export { ChatRoom, ChatRoomParticipant };
export default Chat;
