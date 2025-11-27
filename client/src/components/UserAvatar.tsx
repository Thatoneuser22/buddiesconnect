import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserStatus } from "@shared/schema";

interface UserAvatarProps {
  username: string;
  avatarColor: string;
  status?: UserStatus;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

const statusColors = {
  online: "bg-status-online",
  away: "bg-status-away",
  busy: "bg-status-busy",
  offline: "bg-status-offline",
};

const statusDotSizes = {
  sm: "h-2 w-2 -bottom-0.5 -right-0.5 border",
  md: "h-2.5 w-2.5 -bottom-0.5 -right-0.5 border-2",
  lg: "h-3 w-3 bottom-0 right-0 border-2",
};

export function UserAvatar({ username, avatarColor, status = "offline", size = "md", showStatus = false }: UserAvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();
  
  return (
    <div className="relative inline-flex">
      <Avatar className={sizeClasses[size]}>
        <AvatarFallback 
          style={{ backgroundColor: avatarColor }}
          className="font-semibold text-white"
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span 
          className={`absolute ${statusDotSizes[size]} ${statusColors[status]} rounded-full border-background`}
        />
      )}
    </div>
  );
}
