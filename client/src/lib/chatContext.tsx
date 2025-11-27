import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { User, Channel, Message, Friend, FriendRequest, DirectMessage, TypingUser, UserStatus, WebSocketMessage } from "@shared/schema";
import { setCurrentUserId, queryClient } from "./queryClient";

interface ChatContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  activeChannel: Channel | null;
  setActiveChannel: (channel: Channel | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  friends: Friend[];
  setFriends: (friends: Friend[]) => void;
  friendRequests: FriendRequest[];
  setFriendRequests: (requests: FriendRequest[]) => void;
  directMessages: DirectMessage[];
  setDirectMessages: (dms: DirectMessage[]) => void;
  typingUsers: TypingUser[];
  onlineUsers: Map<string, User>;
  sendMessage: (content: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, replyToId?: string, videoName?: string, audioName?: string) => void;
  sendTypingStart: () => void;
  sendTypingStop: () => void;
  isConnected: boolean;
  activeDM: string | null;
  setActiveDM: (odId: string | null) => void;
  dmMessages: Message[];
  setDmMessages: (messages: Message[]) => void;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, User>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleSetCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    setCurrentUserId(user?.id || null);
  }, []);

  useEffect(() => {
    if (activeChannel) {
      queryClient.fetchQuery<Message[]>({
        queryKey: ["/api/channels", activeChannel.id, "messages"],
      }).then((data) => {
        setMessages(data);
      }).catch(console.error);
    }
  }, [activeChannel]);

  useEffect(() => {
    if (activeDM && currentUser) {
      queryClient.fetchQuery<Message[]>({
        queryKey: ["/api/dm", activeDM, "messages"],
      }).then((data) => {
        setDmMessages(data);
      }).catch(console.error);
    }
  }, [activeDM, currentUser]);

  useEffect(() => {
    if (currentUser) {
      queryClient.fetchQuery<Friend[]>({
        queryKey: ["/api/friends"],
      }).then((data) => {
        setFriends(data);
      }).catch(console.error);

      queryClient.fetchQuery<FriendRequest[]>({
        queryKey: ["/api/friends/requests"],
      }).then((data) => {
        setFriendRequests(data);
      }).catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      socket.send(JSON.stringify({ type: "auth", odId: currentUser.id }));
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      switch (data.type) {
        case "message":
          // Only add if not already added by optimistic update
          setMessages(prev => {
            const exists = prev.some(m => (m.id === data.message.id || (m.userId === data.message.userId && m.timestamp === data.message.timestamp && m.content === data.message.content)));
            if (exists) return prev;
            return [...prev, data.message];
          });
          break;
        case "typing_start":
          setTypingUsers(prev => {
            const exists = prev.some(u => u.odId === data.odId && u.channelId === data.channelId);
            if (exists) return prev;
            return [...prev, { odId: data.odId, username: data.username, channelId: data.channelId }];
          });
          break;
        case "typing_stop":
          setTypingUsers(prev => prev.filter(u => !(u.odId === data.odId && u.channelId === data.channelId)));
          break;
        case "user_status":
          if (data.status === "online") {
            // When user comes online, we'll add them to the map
            // We need to fetch their info, but for now just track the status
            setOnlineUsers(prev => {
              const next = new Map(prev);
              const existingUser = next.get(data.odId);
              if (existingUser) {
                next.set(data.odId, { ...existingUser, status: data.status });
              }
              return next;
            });
          } else {
            setOnlineUsers(prev => {
              const next = new Map(prev);
              next.delete(data.odId);
              return next;
            });
          }
          setFriends(prev => prev.map(f => 
            f.odId === data.odId ? { ...f, status: data.status } : f
          ));
          break;
        case "channel_created":
          setChannels(prev => [...prev, data.channel]);
          break;
        case "friend_request":
          setFriendRequests(prev => [...prev, data.request]);
          break;
        case "friend_accepted":
          setFriends(prev => [...prev, data.friend]);
          break;
        case "dm_message":
          if (activeDM === data.odId) {
            setDmMessages(prev => [...prev, data.message]);
          }
          break;
        case "users_online":
          const newMap = new Map<string, User>();
          data.users.forEach(u => {
            const user: User = { id: u.id, username: u.username, avatarColor: u.avatarColor || "", avatarUrl: u.avatarUrl, status: u.status };
            newMap.set(u.id, user);
          });
          setOnlineUsers(newMap);
          break;
        case "avatar_updated":
          // Update all messages from this user with new avatar
          setMessages(prev => prev.map(m => m.userId === data.userId ? { ...m, avatarUrl: data.avatarUrl } : m));
          // Update user in onlineUsers
          setOnlineUsers(prev => {
            const next = new Map(prev);
            const user = next.get(data.userId);
            if (user) {
              next.set(data.userId, { ...user, avatarUrl: data.avatarUrl });
            }
            return next;
          });
          // Update currentUser if it's the same user
          if (currentUser?.id === data.userId) {
            setCurrentUser({ ...currentUser, avatarUrl: data.avatarUrl });
          }
          break;
        case "error":
          // Error will be handled by calling context (e.g., spam prevention)
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, [currentUser, addMessage, activeDM]);

  const sendMessage = useCallback((content: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, replyToId?: string, videoName?: string, audioName?: string) => {
    if (!wsRef.current || !currentUser || !activeChannel) return;
    
    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      channelId: activeChannel.id,
      userId: currentUser.id,
      username: currentUser.username,
      avatarColor: currentUser.avatarColor,
      avatarUrl: currentUser.avatarUrl,
      timestamp: new Date().toISOString(),
      imageUrl,
      videoUrl,
      videoName,
      audioUrl,
      audioName,
      replyToId,
    };
    addMessage(optimisticMessage);
    
    const messageData = activeDM 
      ? { type: "dm_message", content, toUserId: activeDM, imageUrl, videoUrl, videoName, audioUrl, audioName, replyToId }
      : { type: "message", content, channelId: activeChannel.id, imageUrl, videoUrl, videoName, audioUrl, audioName, replyToId };
    
    wsRef.current.send(JSON.stringify(messageData));
  }, [currentUser, activeChannel, activeDM, addMessage]);

  const sendTypingStart = useCallback(() => {
    if (!wsRef.current || !activeChannel) return;
    wsRef.current.send(JSON.stringify({ type: "typing_start", channelId: activeChannel.id }));
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (wsRef.current && activeChannel) {
        wsRef.current.send(JSON.stringify({ type: "typing_stop", channelId: activeChannel.id }));
      }
    }, 3000);
  }, [activeChannel]);

  const sendTypingStop = useCallback(() => {
    if (!wsRef.current || !activeChannel) return;
    wsRef.current.send(JSON.stringify({ type: "typing_stop", channelId: activeChannel.id }));
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [activeChannel]);

  return (
    <ChatContext.Provider value={{
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      channels,
      setChannels,
      activeChannel,
      setActiveChannel,
      messages,
      setMessages,
      addMessage,
      friends,
      setFriends,
      friendRequests,
      setFriendRequests,
      directMessages,
      setDirectMessages,
      typingUsers,
      onlineUsers,
      sendMessage,
      sendTypingStart,
      sendTypingStop,
      isConnected,
      activeDM,
      setActiveDM,
      dmMessages,
      setDmMessages,
      replyingTo,
      setReplyingTo,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
