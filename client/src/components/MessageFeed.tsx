import { useEffect, useRef } from "react";
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

export function MessageFeed() {
  const { messages, activeChannel, currentUser, activeDM, dmMessages, friends } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const displayMessages = activeDM ? dmMessages : messages.filter(m => m.channelId === activeChannel?.id);
  const dmFriend = activeDM ? friends.find(f => f.odId === activeDM) : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  if (!activeChannel && !activeDM) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Welcome to ChatterBox</h3>
          <p className="text-muted-foreground text-sm">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="py-4 px-4">
          {activeDM && dmFriend && (
            <div className="pb-4 mb-4 border-b">
              <h2 className="text-lg font-semibold">@{dmFriend.username}</h2>
            </div>
          )}
          
          {activeChannel && (
            <div className="pb-4 mb-4 border-b">
              <h2 className="text-lg font-semibold">#{activeChannel.name}</h2>
            </div>
          )}

          <div className="space-y-2">
            {displayMessages.map((message, index) => {
              const previousMessage = index > 0 ? displayMessages[index - 1] : null;
              const isGrouped = shouldGroupMessages(message, previousMessage);

              if (isGrouped) {
                return (
                  <div key={message.id} className="flex gap-2 px-2 py-1" data-testid={`message-${message.id}`}>
                    <div className="w-8 flex-shrink-0 text-right">
                      <span className="text-xs text-muted-foreground">{format(new Date(message.timestamp), "h:mm a")}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm break-words" data-testid={`text-message-content-${message.id}`}>
                        {message.content}
                      </p>
                      {message.imageUrl && (
                        <img 
                          src={message.imageUrl} 
                          alt="Message attachment" 
                          className="mt-2 max-w-xs rounded max-h-64 object-cover"
                        />
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className="flex gap-3 p-2 hover:bg-muted/50 rounded" data-testid={`message-${message.id}`}>
                  <UserAvatar
                    username={message.username}
                    avatarColor={message.avatarColor}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm" data-testid={`text-message-author-${message.id}`}>
                        {message.username}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatMessageTime(message.timestamp)}</span>
                    </div>
                    <p className="text-sm break-words" data-testid={`text-message-content-${message.id}`}>
                      {message.content}
                    </p>
                    {message.imageUrl && (
                      <img 
                        src={message.imageUrl} 
                        alt="Message attachment" 
                        className="mt-2 max-w-xs rounded max-h-64 object-cover"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
