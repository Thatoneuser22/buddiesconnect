import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/chatContext";

export function MemberList() {
  const { onlineUsers, currentUser } = useChat();

  const onlineList = Array.from(onlineUsers.values());

  return (
    <div className="w-48 border-l bg-background flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold">Online Users ({onlineList.length})</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {onlineList.length === 0 ? (
            <p className="text-xs text-muted-foreground">No users online</p>
          ) : (
            onlineList.map((user) => (
              <div key={user.id} className="text-sm text-muted-foreground">
                {user.id === currentUser?.id ? `${currentUser.username} (you)` : user.username || user.id}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
