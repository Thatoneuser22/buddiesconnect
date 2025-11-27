import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@/lib/chatContext";
import { format } from "date-fns";
import { Reply, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import { CustomVideoPlayer } from "./CustomVideoPlayer";
import type { Message } from "@shared/schema";

export function MessageFeed() {
  const { messages, activeChannel, setReplyingTo, typingUsers } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [contextMenu]);

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
  };

  const displayMessages = messages.filter(m => m.channelId === activeChannel?.id);
  
  // Resolve replyTo messages
  const messagesWithReplyResolved = displayMessages.map(msg => {
    if (msg.replyToId && !msg.replyTo) {
      const replyToMsg = messages.find(m => m.id === msg.replyToId);
      return { ...msg, replyTo: replyToMsg };
    }
    return msg;
  });
  
  // Group messages by user
  const groupedMessages = messagesWithReplyResolved.reduce((acc: { user: string; messages: Message[] }[], msg) => {
    if (acc.length === 0 || acc[acc.length - 1].user !== msg.username) {
      acc.push({ user: msg.username, messages: [msg] });
    } else {
      acc[acc.length - 1].messages.push(msg);
    }
    return acc;
  }, []);

  const channelTypingUsers = typingUsers.filter(u => u.channelId === activeChannel?.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length, channelTypingUsers.length]);

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
      <div className="p-1.5 sm:p-4 space-y-0.5 sm:space-y-1">
        {groupedMessages.map((group, groupIdx) => (
          <div key={`${group.user}-${groupIdx}`} className="group animate-message-slide-in mb-1 sm:mb-4">
            {group.messages.map((message, msgIdx) => {
              const isFirstInGroup = msgIdx === 0;
              const isLastInGroup = msgIdx === group.messages.length - 1;

              return (
                <div
                  key={message.id}
                  className={`hover:bg-background/50 px-1.5 sm:px-4 py-0.5 sm:py-1 rounded transition ${
                    isFirstInGroup ? "pt-0.5 sm:pt-2" : ""
                  } ${isLastInGroup ? "pb-0.5 sm:pb-2" : ""}`}
                  data-testid={`message-item-${message.id}`}
                  onContextMenu={(e) => handleContextMenu(e, message)}
                >
                  {isFirstInGroup && (
                    <div className="flex items-center gap-0.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <Avatar className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0">
                        {message.avatarUrl ? (
                          <AvatarImage src={message.avatarUrl} alt={message.username} />
                        ) : null}
                        <AvatarFallback style={{ backgroundColor: message.avatarColor }} className="text-xs">
                          {message.username.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-xs truncate">{message.username}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{format(new Date(message.timestamp), "h:mm a")}</span>
                    </div>
                  )}

                  {message.replyTo && (
                    <div className="text-xs mb-0.5 sm:mb-2 pl-1.5 sm:pl-3 border-l-2 border-muted-foreground text-muted-foreground">
                      <p className="font-semibold text-blue-500 text-xs">{message.replyTo.username}</p>
                      <p className="truncate text-xs">{message.replyTo.content || "[media]"}</p>
                    </div>
                  )}

                  <div className="flex gap-0.5 sm:gap-3 items-start">
                    <div className="flex-1 ml-0 min-w-0">
                      {message.content && (
                        <p className="text-xs break-words whitespace-pre-wrap max-w-xs">
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
                        <div className="mt-0.5 sm:mt-2 relative w-fit group animate-fade-in">
                          <img src={message.imageUrl} alt="attachment" className="max-w-xs rounded max-h-32 sm:max-h-64 object-cover" />
                          <button
                            onClick={() => downloadFile(message.imageUrl!, "image.jpg")}
                            className="absolute top-0.5 sm:top-2 right-0.5 sm:right-2 flex items-center gap-1 px-1 sm:px-2 py-0.5 bg-black/70 hover:bg-black/90 rounded text-xs text-white transition opacity-0 group-hover:opacity-100"
                            data-testid={`download-image-${message.id}`}
                          >
                            <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </div>
                      )}
                      {message.videoUrl && (
                        <div className="mt-0.5 sm:mt-2 max-w-xs animate-fade-in">
                          <CustomVideoPlayer src={message.videoUrl} title={message.videoName || "Video"} />
                        </div>
                      )}
                      {message.audioUrl && (
                        <div className="mt-0.5 sm:mt-2 max-w-xs animate-fade-in">
                          <CustomAudioPlayer src={message.audioUrl} title={message.audioName || "Audio"} />
                        </div>
                      )}
                    </div>
                    {isFirstInGroup && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0"
                        onClick={() => setReplyingTo(message)}
                        data-testid={`reply-button-${message.id}`}
                      >
                        <Reply className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {channelTypingUsers.length > 0 && (
          <div className="animate-message-slide-in">
            <div className="text-xs sm:text-sm text-muted-foreground">
              <span className="line-clamp-1">{channelTypingUsers.map(u => u.username).join(", ")}</span>{" "}
              <span className="inline-flex items-center gap-0.5 sm:gap-1">
                is typing
                <span className="flex gap-0.5 sm:gap-1">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-muted-foreground rounded-full animate-typing"></span>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-muted-foreground rounded-full animate-typing animation-delay-200"></span>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-muted-foreground rounded-full animate-typing animation-delay-400"></span>
                </span>
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-popover border border-border rounded-md shadow-lg z-50 py-1"
          style={{ 
            top: `${Math.min(contextMenu.y, window.innerHeight - 120)}px`, 
            left: `${Math.min(contextMenu.x, window.innerWidth - 140)}px`
          }}
        >
          <button
            onClick={() => {
              setReplyingTo(contextMenu.message);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition whitespace-nowrap"
            data-testid="context-menu-reply"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>

          {(contextMenu.message.imageUrl || contextMenu.message.videoUrl || contextMenu.message.audioUrl) && (
            <button
              onClick={() => {
                const isImage = contextMenu.message.imageUrl;
                const isVideo = contextMenu.message.videoUrl;
                const url = isImage ? contextMenu.message.imageUrl! : isVideo ? contextMenu.message.videoUrl! : contextMenu.message.audioUrl!;
                const filename = isImage ? "image.jpg" : isVideo ? contextMenu.message.videoName || "video.mp4" : contextMenu.message.audioName || "audio.mp3";
                downloadFile(url, filename);
              }}
              className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition whitespace-nowrap"
              data-testid="context-menu-download"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          )}
        </div>
      )}
    </ScrollArea>
  );
}
