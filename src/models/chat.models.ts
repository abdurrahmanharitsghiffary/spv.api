import prisma from "../config/prismaClient";

const Chat = prisma.chat;
const ChatRoom = prisma.chatRoom;
const ChatRoomParticipant = prisma.chatRoomParticipant;
const ReadChat = prisma.messageRead;

export { ChatRoom, ChatRoomParticipant, ReadChat };
export default Chat;
