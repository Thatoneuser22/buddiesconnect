import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/chatContext";
import { UserAvatar } from "./UserAvatar";
import { format, isToday, isYesterday } from "date-fns";
import type { Message } from "@shared/schema";

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }
  return format(date, "MM/dd/yyyy h:mm a");
}

function shouldGroupMessages(current: Message, previous: Message | null): boolean {
  if (!previous) return false;
  if (current.userId !== previous.userId) return false;
  
  const currentTime = new Date(current.timestamp).getTime();
  const previousTime = new Date(previous.timestamp).getTime();
  const fiveMinutes = 5 * 60 * 1000;
  
  return currentTime - previousTime < fiveMinutes;
}

interface MessageItemProps {
  message: Message;
  isGrouped: boolean;
  index: number;
}

function MessageItem({ message, isGrouped, index }: MessageItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  if (isGrouped) {
    return (
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="group flex items-start gap-3 px-4 py-0.5 hover-elevate rounded-md" 
        data-testid={`message-${message.id}`}
      >
        <div className="w-8 flex-shrink-0 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {format(new Date(message.timestamp), "h:mm a")}
          </span>
        </div>
        <p className="text-sm leading-relaxed break-words" data-testid={`text-message-content-${message.id}`}>
          {message.content}
        </p>
        {message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Message attachment" 
            className="mt-2 max-w-xs rounded-md max-h-96 object-cover"
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group flex items-start gap-3 px-4 py-2 hover-elevate rounded-md" 
      data-testid={`message-${message.id}`}
    >
      <UserAvatar
        username={message.username}
        avatarColor={message.avatarColor}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-medium" data-testid={`text-message-author-${message.id}`}>
            {message.username}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.timestamp)}
          </span>
        </div>
        <p className="text-sm leading-relaxed break-words" data-testid={`text-message-content-${message.id}`}>
          {message.content}
        </p>
        {message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Message attachment" 
            className="mt-2 max-w-xs rounded-md max-h-96 object-cover"
          />
        )}
      </div>
    </motion.div>
  );
}

export function MessageFeed() {
  const { messages, activeChannel, typingUsers, currentUser, activeDM, dmMessages, friends } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const displayMessages = activeDM ? dmMessages : messages.filter(m => m.channelId === activeChannel?.id);
  const channelTypingUsers = typingUsers.filter(
    u => u.channelId === activeChannel?.id && u.odId !== currentUser?.id
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  const dmFriend = activeDM ? friends.find(f => f.odId === activeDM) : null;

  if (!activeChannel && !activeDM) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-muted-foreground">#</span>
          </div>
          <h3 className="text-lg font-medium mb-1">Welcome to ChatterBox</h3>
          <p className="text-muted-foreground text-sm">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="py-4">
          <div className="px-4 pb-4 mb-4 border-b border-border">
            {activeDM && dmFriend ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <UserAvatar
                    username={dmFriend.username}
                    avatarColor={dmFriend.avatarColor}
                    size="lg"
                    status={dmFriend.status}
                    showStatus
                  />
                  <h2 className="text-xl font-bold">{dmFriend.username}</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  This is the beginning of your direct message history with{" "}
                  <span className="font-medium">{dmFriend.username}</span>.
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <span className="text-2xl text-muted-foreground">#</span>
                </div>
                <h2 className="text-xl font-bold">Welcome to #{activeChannel?.name}</h2>
                <p className="text-muted-foreground text-sm">
                  This is the start of the #{activeChannel?.name} channel.
                </p>
              </>
            )}
          </div>

          <div className="space-y-0">
            {displayMessages.map((message, index) => {
              const previousMessage = index > 0 ? displayMessages[index - 1] : null;
              const isGrouped = shouldGroupMessages(message, previousMessage);
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isGrouped={isGrouped}
                  index={index}
                />
              );
            })}
          </div>

          <AnimatePresence>
            {channelTypingUsers.length > 0 && (
              <motion.div 
                className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="flex gap-1">
                  <motion.span 
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span 
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                  />
                  <motion.span 
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                  />
                </span>
                <span>
                  {channelTypingUsers.length === 1
                    ? `${channelTypingUsers[0].username} is typing...`
                    : `${channelTypingUsers.length} people are typing...`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
