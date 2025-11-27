import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/chatContext";
import { UserAvatar } from "./UserAvatar";
import type { User, UserStatus } from "@shared/schema";

interface MemberGroup {
  title: string;
  members: User[];
}

export function MemberList() {
  const { friends, currentUser, onlineUsers } = useChat();

  const allMembers: User[] = currentUser 
    ? [
        currentUser,
        ...friends.map(f => ({
          id: f.odId,
          username: f.username,
          avatarColor: f.avatarColor,
          status: onlineUsers.get(f.odId) || f.status,
        }))
      ]
    : [];

  const onlineMembers = allMembers.filter(m => m.status !== "offline");
  const offlineMembers = allMembers.filter(m => m.status === "offline");

  const groups: MemberGroup[] = [
    { title: `ONLINE — ${onlineMembers.length}`, members: onlineMembers },
    { title: `OFFLINE — ${offlineMembers.length}`, members: offlineMembers },
  ].filter(g => g.members.length > 0);

  return (
    <div className="w-60 bg-sidebar border-l border-sidebar-border hidden lg:flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3">
          {groups.map((group) => (
            <div key={group.title} className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2 mb-2">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.members.map((member) => (
                  <button
                    key={member.id}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover-elevate active-elevate-2"
                    data-testid={`button-member-${member.id}`}
                  >
                    <UserAvatar
                      username={member.username}
                      avatarColor={member.avatarColor}
                      status={member.status}
                      size="md"
                      showStatus
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm truncate ${member.status === "offline" ? "text-muted-foreground" : ""}`}>
                        {member.username}
                        {member.id === currentUser?.id && (
                          <span className="text-xs text-muted-foreground ml-1">(you)</span>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          {allMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No members yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
