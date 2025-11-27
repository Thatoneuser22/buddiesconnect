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

  const isSafeLink = (text: string): boolean => {
    try {
      const url = new URL(text);
      const protocol = url.protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  };

  const isLink = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

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
              <p className="text-sm">
                {isLink(message.content) ? (
                  isSafeLink(message.content) ? (
                    <a href={message.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {message.content}
                    </a>
                  ) : (
                    <span className="text-gray-500 cursor-not-allowed">{message.content}</span>
                  )
                ) : (
                  message.content
                )}
              </p>
              {message.imageUrl && message.imageUrl.startsWith("data:image/") && (
                <img src={message.imageUrl} alt="attachment" className="mt-2 max-w-xs rounded max-h-64 object-cover" />
              )}
              {message.videoUrl && message.videoUrl.startsWith("data:video/") && (
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
