import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/chatContext";
import { format } from "date-fns";
import { Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import { CustomVideoPlayer } from "./CustomVideoPlayer";
import type { Message } from "@shared/schema";

export function MessageFeed() {
  const { messages, activeChannel, setReplyingTo } = useChat();
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
      <div className="p-4 space-y-3">
        {displayMessages.map((message) => (
          <div key={message.id} className="group hover:bg-background/50 p-2 rounded transition">
            {message.replyTo && (
              <div className="text-xs mb-1 pl-3 border-l-2 border-muted-foreground text-muted-foreground">
                <p className="font-semibold text-blue-500">{message.replyTo.username}</p>
                <p className="truncate">{message.replyTo.content || "[media]"}</p>
              </div>
            )}
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{message.username}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(message.timestamp), "h:mm a")}</span>
                </div>
                {message.content && (
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
                )}
                {message.imageUrl && (
                  <img src={message.imageUrl} alt="attachment" className="mt-2 max-w-xs rounded max-h-64 object-cover" />
                )}
                {message.videoUrl && (
                  <div className="mt-2 max-w-sm">
                    <CustomVideoPlayer src={message.videoUrl} title={message.videoName || "Video"} />
                  </div>
                )}
                {message.audioUrl && (
                  <div className="mt-2 max-w-sm">
                    <CustomAudioPlayer src={message.audioUrl} title={message.audioName || "Audio"} />
                  </div>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition h-8 w-8"
                onClick={() => setReplyingTo(message)}
              >
                <Reply className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
