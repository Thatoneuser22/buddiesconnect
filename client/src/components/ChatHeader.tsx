import { Hash, Users, Bell, Pin, Search, Inbox, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./ThemeToggle";
import { useChat } from "@/lib/chatContext";
import { UserAvatar } from "./UserAvatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatHeaderProps {
  onToggleSidebar?: () => void;
  onToggleMembers?: () => void;
  showMemberToggle?: boolean;
}

export function ChatHeader({ onToggleSidebar, onToggleMembers, showMemberToggle = true }: ChatHeaderProps) {
  const { activeChannel, activeDM, friends, isConnected } = useChat();
  
  const dmFriend = activeDM ? friends.find(f => f.odId === activeDM) : null;

  return (
    <div className="h-12 flex items-center gap-2 px-4 border-b border-border bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onToggleSidebar}
        data-testid="button-toggle-sidebar"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {activeDM && dmFriend ? (
        <div className="flex items-center gap-2">
          <UserAvatar
            username={dmFriend.username}
            avatarColor={dmFriend.avatarColor}
            status={dmFriend.status}
            size="sm"
            showStatus
          />
          <span className="font-semibold text-sm">{dmFriend.username}</span>
        </div>
      ) : activeChannel ? (
        <div className="flex items-center gap-1">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-sm">{activeChannel.name}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Select a channel</span>
      )}

      {!isConnected && (
        <span className="text-xs text-destructive ml-2">Connecting...</span>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-search">
              <Search className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-inbox">
              <Inbox className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Inbox</TooltipContent>
        </Tooltip>

        <ThemeToggle />

        {showMemberToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleMembers}
                className="hidden md:flex lg:hidden"
                data-testid="button-toggle-members"
              >
                <Users className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Member List</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
