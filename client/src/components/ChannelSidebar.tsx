import { Hash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/lib/chatContext";
import { UserAvatar } from "./UserAvatar";

export function ChannelSidebar() {
  const { 
    currentUser, 
    channels, 
    activeChannel,
    setActiveChannel,
    friends,
    setActiveDM,
    activeDM,
  } = useChat();
  const { toast } = useToast();

  const generalChannel = channels.find(c => c.name === "general");


  return (
    <div className="w-64 flex flex-col border-r h-full bg-background">
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg">ChatterBox</h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {generalChannel && (
            <button
              onClick={() => {
                setActiveChannel(generalChannel);
                setActiveDM(null);
              }}
              className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${
                activeChannel?.id === generalChannel.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              data-testid={`button-channel-${generalChannel.id}`}
            >
              <Hash className="w-4 h-4" />
              general
            </button>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold text-sm mb-2">Friends</h3>
            <div className="space-y-1">
              {friends.map(friend => (
                <button
                  key={friend.odId}
                  onClick={() => {
                    setActiveDM(friend.odId);
                    setActiveChannel(null);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${
                    activeDM === friend.odId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  data-testid={`button-friend-${friend.odId}`}
                >
                  <UserAvatar
                    username={friend.username}
                    avatarColor={friend.avatarColor}
                    size="sm"
                  />
                  <span className="truncate">{friend.username}</span>
                  <div className={`w-2 h-2 rounded-full ml-auto flex-shrink-0 ${friend.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <UserAvatar
            username={currentUser?.username || ""}
            avatarColor={currentUser?.avatarColor || ""}
            size="sm"
          />
          <span className="text-sm truncate flex-1">{currentUser?.username}</span>
        </div>
      </div>
    </div>
  );
}
