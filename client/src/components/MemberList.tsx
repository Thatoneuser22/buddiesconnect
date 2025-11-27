import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@/lib/chatContext";
import { Circle } from "lucide-react";

export function MemberList() {
  const { onlineUsers, currentUser } = useChat();

  const onlineList = Array.from(onlineUsers.values());

  return (
    <div className="w-56 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border sticky top-0 bg-card">
        <h3 className="text-sm font-semibold">Members ({onlineList.length})</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {onlineList.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">No members online</p>
          ) : (
            onlineList.map((user) => {
              const initials = user.username
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();
              const isCurrentUser = user.id === currentUser?.id;
              
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-background/50 transition animate-fade-in"
                  data-testid={`member-item-${user.id}`}
                >
                  <Circle className="w-2 h-2 fill-green-500 text-green-500 flex-shrink-0" />
                  <Avatar className="h-6 w-6">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                    ) : null}
                    <AvatarFallback style={{ backgroundColor: user.avatarColor }} className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate text-foreground">
                    {isCurrentUser ? `${user.username} (you)` : user.username}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
