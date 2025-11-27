import { Hash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/lib/chatContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function ChannelSidebar() {
  const { currentUser, channels, activeChannel, setActiveChannel, friends, setActiveDM, activeDM } = useChat();
  const [, setLocation] = useLocation();

  const generalChannel = channels.find(c => c.name === "general");

  const handleLogout = () => {
    setLocation("/");
    window.location.reload();
  };

  return (
    <div className="w-64 flex flex-col border-r h-full">
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
              className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                activeChannel?.id === generalChannel.id ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Hash className="w-4 h-4" />
              general
            </button>
          )}

          <Separator />

          {friends.length > 0 && (
            <div>
              <h3 className="font-semibold text-xs px-3 mb-2">Friends</h3>
              <div className="space-y-1">
                {friends.map(friend => (
                  <button
                    key={friend.odId}
                    onClick={() => {
                      setActiveDM(friend.odId);
                      setActiveChannel(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      activeDM === friend.odId ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {friend.username}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        <p className="text-xs text-muted-foreground">Logged in as</p>
        <p className="font-semibold text-sm">{currentUser?.username}</p>
        <Button onClick={handleLogout} size="sm" variant="outline" className="w-full text-xs">
          Logout
        </Button>
      </div>
    </div>
  );
}
