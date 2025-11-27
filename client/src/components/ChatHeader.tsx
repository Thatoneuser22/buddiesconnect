import { useChat } from "@/lib/chatContext";

export function ChatHeader() {
  const { activeChannel } = useChat();

  return (
    <div className="h-12 flex items-center px-4 border-b bg-background">
      {activeChannel ? (
        <span className="font-semibold text-sm">{activeChannel.name}</span>
      ) : (
        <span className="text-muted-foreground text-sm">Chat</span>
      )}
    </div>
  );
}
