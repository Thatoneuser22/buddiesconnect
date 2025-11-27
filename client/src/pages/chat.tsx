import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageFeed } from "@/components/MessageFeed";
import { MessageInput } from "@/components/MessageInput";
import { MemberList } from "@/components/MemberList";
import { FriendsPanel } from "@/components/FriendsPanel";
import { useChat } from "@/lib/chatContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Users } from "lucide-react";

export default function Chat() {
  const { currentUser, activeChannel, activeDM } = useChat();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLocation("/");
    }
  }, [currentUser, setLocation]);

  if (!currentUser) {
    return null;
  }

  const showChatArea = activeChannel || activeDM;

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <ChannelSidebar />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">
        <ChannelSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader 
          onToggleSidebar={() => setSidebarOpen(true)}
          onToggleMembers={() => setMembersOpen(!membersOpen)}
        />
        
        <div className="flex-1 flex overflow-hidden">
          {showChatArea ? (
            <div className="flex-1 flex flex-col min-w-0">
              <MessageFeed />
              <MessageInput />
            </div>
          ) : (
            <FriendsPanel />
          )}
        </div>
      </div>

      <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
        <SheetContent side="right" className="p-0 w-60">
          <MemberList />
        </SheetContent>
      </Sheet>

      <MemberList />
    </div>
  );
}
