import { useChat } from "@/lib/chatContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function ChannelSidebar() {
  const { currentUser } = useChat();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/");
    window.location.reload();
  };

  return (
    <div className="w-48 flex flex-col border-r h-full">
      <div className="flex-1 p-4">
        <p className="text-xs text-muted-foreground mb-2">User</p>
        <p className="font-semibold text-sm">{currentUser?.username}</p>
      </div>

      <div className="p-4 border-t">
        <Button onClick={handleLogout} size="sm" variant="outline" className="w-full text-xs">
          Leave
        </Button>
      </div>
    </div>
  );
}
