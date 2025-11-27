import { useChat } from "@/lib/chatContext";
import { ThemeToggle } from "./ThemeToggle";
import { AvatarUpload } from "./AvatarUpload";

export function ChatHeader() {
  const { activeChannel } = useChat();

  return (
    <div className="h-12 flex items-center justify-between px-4 border-b bg-background">
      <div className="flex items-center gap-2">
        {activeChannel ? (
          <span className="font-semibold text-sm">{activeChannel.name}</span>
        ) : (
          <span className="text-muted-foreground text-sm">Chat</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <AvatarUpload />
        <ThemeToggle />
      </div>
    </div>
  );
}
