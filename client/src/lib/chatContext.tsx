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
  onlineUsers: Map<string, UserStatus>;
  sendMessage: (content: string, imageUrl?: string, videoUrl?: string) => void;
  sendTypingStart: () => void;
  sendTypingStop: () => void;
  isConnected: boolean;
  activeDM: string | null;
  setActiveDM: (odId: string | null) => void;
  dmMessages: Message[];
  setDmMessages: (messages: Message[]) => void;
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
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserStatus>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<Message[]>([]);
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
          addMessage(data.message);
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
          setOnlineUsers(prev => {
            const next = new Map(prev);
            next.set(data.odId, data.status);
            return next;
          });
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
          const newMap = new Map<string, UserStatus>();
          data.users.forEach(u => newMap.set(u.id, u.status));
          setOnlineUsers(newMap);
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, [currentUser, addMessage, activeDM]);

  const sendMessage = useCallback((content: string, imageUrl?: string, videoUrl?: string) => {
    if (!wsRef.current || !currentUser) return;
    
    const messageData = activeDM 
      ? { type: "dm_message", content, toUserId: activeDM, imageUrl, videoUrl }
      : { type: "message", content, channelId: activeChannel?.id, imageUrl, videoUrl };
    
    wsRef.current.send(JSON.stringify(messageData));
  }, [currentUser, activeChannel, activeDM]);

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
