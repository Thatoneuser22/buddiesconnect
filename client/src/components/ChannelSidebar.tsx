import { Hash } from "lucide-react";
import { useChat } from "@/lib/chatContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function ChannelSidebar() {
  const { currentUser, channels, activeChannel, setActiveChannel } = useChat();
  const [, setLocation] = useLocation();

  const generalChannel = channels.find(c => c.name === "general");

  const handleLogout = () => {
    setLocation("/");
    window.location.reload();
  };

  return (
    <div className="w-64 flex flex-col border-r h-full">
      <div className="flex-1 p-4">
        {generalChannel && (
          <button
            onClick={() => {
              setActiveChannel(generalChannel);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
              activeChannel?.id === generalChannel.id ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Hash className="w-4 h-4" />
            general
          </button>
        )}
      </div>

      <div className="p-4 border-t space-y-2">
        <p className="font-semibold text-sm">{currentUser?.username}</p>
        <Button onClick={handleLogout} size="sm" variant="outline" className="w-full text-xs">
          Leave
        </Button>
      </div>
    </div>
  );
}
