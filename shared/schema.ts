import { z } from "zod";

export const userStatusEnum = z.enum(["online", "away", "busy", "offline"]);
export type UserStatus = z.infer<typeof userStatusEnum>;

export const users = {
  id: "",
  username: "",
  avatarColor: "",
  status: "offline" as UserStatus,
};

export const insertUserSchema = z.object({
  username: z.string().min(2).max(32),
  avatarColor: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: string;
  username: string;
  avatarColor: string;
  status: UserStatus;
};

export const channelTypeEnum = z.enum(["text", "voice"]);
export type ChannelType = z.infer<typeof channelTypeEnum>;

export const insertChannelSchema = z.object({
  name: z.string().min(1).max(100),
  type: channelTypeEnum.default("text"),
  category: z.string().optional(),
});

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  category?: string;
};

export const insertMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  channelId: z.string(),
  imageUrl: z.string().optional(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  username: string;
  avatarColor: string;
  timestamp: string;
  imageUrl?: string;
};

export const insertFriendRequestSchema = z.object({
  toUsername: z.string(),
});

export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type FriendRequest = {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  status: "pending" | "accepted" | "declined";
};

export type Friend = {
  id: string;
  odId: string;
  username: string;
  avatarColor: string;
  status: UserStatus;
};

export type DirectMessage = {
  odId: string;
  odUsername: string;
  odAvatarColor: string;
  odStatus: UserStatus;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
};

export type TypingUser = {
  odId: string;
  username: string;
  channelId: string;
};

export type WebSocketMessage = 
  | { type: "auth"; userId: string }
  | { type: "message"; message: Message }
  | { type: "typing_start"; channelId: string; odId: string; username: string }
  | { type: "typing_stop"; channelId: string; odId: string }
  | { type: "user_status"; odId: string; status: UserStatus }
  | { type: "channel_created"; channel: Channel }
  | { type: "friend_request"; request: FriendRequest }
  | { type: "friend_accepted"; friend: Friend }
  | { type: "dm_message"; message: Message; odId: string }
  | { type: "users_online"; users: { id: string; status: UserStatus }[] };
