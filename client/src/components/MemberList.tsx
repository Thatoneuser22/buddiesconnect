import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@/lib/chatContext";
import { Circle } from "lucide-react";

export function MemberList() {
  const { onlineUsers, currentUser } = useChat();

  const onlineList = Array.from(onlineUsers.values());

  return (
    <div className="w-28 sm:w-56 border-l border-border bg-card flex flex-col">
      <div className="p-1.5 sm:p-4 border-b border-border sticky top-0 bg-card z-10">
        <h3 className="text-xs sm:text-sm font-semibold">Members ({onlineList.length})</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-1 sm:p-3 space-y-0.5 sm:space-y-1">
          {onlineList.length === 0 ? (
            <p className="text-xs text-muted-foreground p-1 sm:p-2">No members</p>
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
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded hover:bg-background/50 transition animate-fade-in"
                  data-testid={`member-item-${user.id}`}
                >
                  <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500 flex-shrink-0" />
                  <Avatar className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                    ) : null}
                    <AvatarFallback style={{ backgroundColor: user.avatarColor }} className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs sm:text-sm truncate text-foreground">
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
