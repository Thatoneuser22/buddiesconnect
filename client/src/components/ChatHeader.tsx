import { useChat } from "@/lib/chatContext";
import { ThemeToggle } from "./ThemeToggle";
import { AvatarUpload } from "./AvatarUpload";

export function ChatHeader() {
  const { activeChannel } = useChat();

  return (
    <div className="h-10 sm:h-12 flex items-center justify-between px-2 sm:px-4 border-b bg-background gap-2">
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        {activeChannel ? (
          <span className="font-semibold text-xs sm:text-sm truncate">{activeChannel.name}</span>
        ) : (
          <span className="text-muted-foreground text-xs sm:text-sm">Chat</span>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <AvatarUpload />
        <ThemeToggle />
      </div>
    </div>
  );
}
