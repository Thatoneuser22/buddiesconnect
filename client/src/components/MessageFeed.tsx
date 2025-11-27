import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/chatContext";
import { UserAvatar } from "./UserAvatar";
import { format } from "date-fns";
import type { Message } from "@shared/schema";

export function MessageFeed() {
  const { messages, activeChannel, currentUser, activeDM, dmMessages, friends } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const displayMessages = activeDM ? dmMessages : messages.filter(m => m.channelId === activeChannel?.id);
  const dmFriend = activeDM ? friends.find(f => f.odId === activeDM) : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [displayMessages.length]);

  if (!activeChannel && !activeDM) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Select a channel to chat</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {displayMessages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <UserAvatar username={message.username} avatarColor={message.avatarColor} size="sm" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{message.username}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(message.timestamp), "h:mm a")}</span>
              </div>
              <p className="text-sm">{message.content}</p>
              {message.imageUrl && (
                <img src={message.imageUrl} alt="attachment" className="mt-2 max-w-xs rounded max-h-64 object-cover" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
