import { Hash } from "lucide-react";
import { useChat } from "@/lib/chatContext";

export function ChatHeader() {
  const { activeChannel, activeDM, friends } = useChat();
  const dmFriend = activeDM ? friends.find(f => f.odId === activeDM) : null;

  return (
    <div className="h-14 flex items-center px-4 border-b bg-background">
      {activeDM && dmFriend ? (
        <span className="font-semibold text-sm">@{dmFriend.username}</span>
      ) : activeChannel ? (
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          <span className="font-semibold text-sm">{activeChannel.name}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Select a channel</span>
      )}
    </div>
  );
}
