import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/chatContext";
import { format } from "date-fns";
import type { Message } from "@shared/schema";

export function MessageFeed() {
  const { messages, activeChannel } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const displayMessages = messages.filter(m => m.channelId === activeChannel?.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [displayMessages.length]);

  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chat</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {displayMessages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{message.username}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(message.timestamp), "h:mm a")}</span>
              </div>
              <p className="text-sm">{message.content}</p>
              {message.imageUrl && (
                <img src={message.imageUrl} alt="attachment" className="mt-2 max-w-xs rounded max-h-64 object-cover" />
              )}
              {message.videoUrl && (
                <video src={message.videoUrl} controls className="mt-2 max-w-xs rounded max-h-64" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
