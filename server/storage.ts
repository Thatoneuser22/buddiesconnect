import type { 
  User, InsertUser, 
  Channel, InsertChannel, 
  Message, InsertMessage,
  Friend, FriendRequest, InsertFriendRequest,
  UserStatus
} from "@shared/schema";
import { randomUUID } from "crypto";

const AVATAR_COLORS = [
  "#5865F2", "#57F287", "#FEE75C", "#EB459E", "#ED4245",
  "#9B59B6", "#3498DB", "#1ABC9C", "#E91E63", "#FF9800"
];

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: string, status: UserStatus): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  getChannels(): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  
  getMessages(channelId: string): Promise<Message[]>;
  createMessage(userId: string, message: InsertMessage): Promise<Message>;
  getDMMessages(user1Id: string, user2Id: string): Promise<Message[]>;
  createDMMessage(fromUserId: string, toUserId: string, content: string): Promise<Message>;
  
  getFriends(userId: string): Promise<Friend[]>;
  getFriendRequests(userId: string): Promise<FriendRequest[]>;
  createFriendRequest(fromUserId: string, toUsername: string): Promise<FriendRequest>;
  acceptFriendRequest(requestId: string): Promise<{ friend1: Friend; friend2: Friend } | undefined>;
  declineFriendRequest(requestId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private channels: Map<string, Channel>;
  private messages: Map<string, Message>;
  private friendRequests: Map<string, FriendRequest>;
  private friendships: Map<string, Set<string>>;
  private dmMessages: Map<string, Message[]>;

  constructor() {
    this.users = new Map();
    this.channels = new Map();
    this.messages = new Map();
    this.friendRequests = new Map();
    this.friendships = new Map();
    this.dmMessages = new Map();
    
    const defaultChannels: InsertChannel[] = [
      { name: "general", type: "text" },
      { name: "random", type: "text" },
      { name: "introductions", type: "text" },
    ];
    
    defaultChannels.forEach(ch => {
      const id = randomUUID();
      this.channels.set(id, { id, ...ch, type: ch.type || "text" });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const avatarColor = insertUser.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    
    const user: User = { 
      id, 
      username: insertUser.username,
      avatarColor,
      status: "online"
    };
    this.users.set(id, user);
    this.friendships.set(id, new Set());
    return user;
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.status = status;
      this.users.set(id, user);
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }


  async getChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = randomUUID();
    const channel: Channel = { 
      id, 
      name: insertChannel.name,
      type: insertChannel.type || "text",
      category: insertChannel.category
    };
    this.channels.set(id, channel);
    return channel;
  }

  async getMessages(channelId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.channelId === channelId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(userId: string, insertMessage: InsertMessage): Promise<Message> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const id = randomUUID();
    const message: Message = {
      id,
      content: insertMessage.content,
      channelId: insertMessage.channelId,
      userId: user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      timestamp: new Date().toISOString(),
      imageUrl: insertMessage.imageUrl,
      videoUrl: insertMessage.videoUrl,
      videoName: (insertMessage as any).videoName,
      audioUrl: insertMessage.audioUrl,
      audioName: (insertMessage as any).audioName,
      replyToId: insertMessage.replyToId,
    };
    if (insertMessage.replyToId) {
      message.replyTo = this.messages.get(insertMessage.replyToId);
    }
    this.messages.set(id, message);
    return message;
  }

  async getDMMessages(user1Id: string, user2Id: string): Promise<Message[]> {
    const key = [user1Id, user2Id].sort().join("-");
    return this.dmMessages.get(key) || [];
  }

  async createDMMessage(fromUserId: string, toUserId: string, content: string): Promise<Message> {
    const user = await this.getUser(fromUserId);
    if (!user) throw new Error("User not found");
    
    const id = randomUUID();
    const message: Message = {
      id,
      content,
      channelId: "dm",
      userId: user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      timestamp: new Date().toISOString(),
    };
    
    const key = [fromUserId, toUserId].sort().join("-");
    const existing = this.dmMessages.get(key) || [];
    existing.push(message);
    this.dmMessages.set(key, existing);
    
    return message;
  }

  async getFriends(userId: string): Promise<Friend[]> {
    const friendIds = this.friendships.get(userId) || new Set();
    const friends: Friend[] = [];
    
    const friendIdArray = Array.from(friendIds);
    for (let i = 0; i < friendIdArray.length; i++) {
      const friendId = friendIdArray[i];
      const user = await this.getUser(friendId);
      if (user) {
        friends.push({
          id: `${userId}-${friendId}`,
          odId: user.id,
          username: user.username,
          avatarColor: user.avatarColor,
          status: user.status,
        });
      }
    }
    
    return friends;
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    return Array.from(this.friendRequests.values())
      .filter(r => r.toUserId === userId && r.status === "pending");
  }

  async createFriendRequest(fromUserId: string, toUsername: string): Promise<FriendRequest> {
    const fromUser = await this.getUser(fromUserId);
    const toUser = await this.getUserByUsername(toUsername);
    
    if (!fromUser) throw new Error("User not found");
    if (!toUser) throw new Error("User not found");
    if (fromUser.id === toUser.id) throw new Error("Cannot add yourself");
    
    const friendIds = this.friendships.get(fromUserId) || new Set();
    if (friendIds.has(toUser.id)) throw new Error("Already friends");
    
    const existingRequest = Array.from(this.friendRequests.values()).find(
      r => (r.fromUserId === fromUserId && r.toUserId === toUser.id) ||
           (r.fromUserId === toUser.id && r.toUserId === fromUserId)
    );
    if (existingRequest) throw new Error("Request already exists");
    
    const id = randomUUID();
    const request: FriendRequest = {
      id,
      fromUserId,
      fromUsername: fromUser.username,
      toUserId: toUser.id,
      toUsername: toUser.username,
      status: "pending",
    };
    this.friendRequests.set(id, request);
    return request;
  }

  async acceptFriendRequest(requestId: string): Promise<{ friend1: Friend; friend2: Friend } | undefined> {
    const request = this.friendRequests.get(requestId);
    if (!request || request.status !== "pending") return undefined;
    
    request.status = "accepted";
    this.friendRequests.set(requestId, request);
    
    const fromUserFriends = this.friendships.get(request.fromUserId) || new Set();
    const toUserFriends = this.friendships.get(request.toUserId) || new Set();
    
    fromUserFriends.add(request.toUserId);
    toUserFriends.add(request.fromUserId);
    
    this.friendships.set(request.fromUserId, fromUserFriends);
    this.friendships.set(request.toUserId, toUserFriends);
    
    const fromUser = await this.getUser(request.fromUserId);
    const toUser = await this.getUser(request.toUserId);
    
    if (!fromUser || !toUser) return undefined;
    
    return {
      friend1: {
        id: `${request.fromUserId}-${request.toUserId}`,
        odId: toUser.id,
        username: toUser.username,
        avatarColor: toUser.avatarColor,
        status: toUser.status,
      },
      friend2: {
        id: `${request.toUserId}-${request.fromUserId}`,
        odId: fromUser.id,
        username: fromUser.username,
        avatarColor: fromUser.avatarColor,
        status: fromUser.status,
      }
    };
  }

  async declineFriendRequest(requestId: string): Promise<boolean> {
    const request = this.friendRequests.get(requestId);
    if (!request || request.status !== "pending") return false;
    
    request.status = "declined";
    this.friendRequests.set(requestId, request);
    return true;
  }
}

export const storage = new MemStorage();
