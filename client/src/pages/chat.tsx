import { useEffect } from "react";
import { useLocation } from "wouter";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageFeed } from "@/components/MessageFeed";
import { MessageInput } from "@/components/MessageInput";
import { MemberList } from "@/components/MemberList";
import { useChat } from "@/lib/chatContext";

export default function Chat() {
  const { currentUser } = useChat();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!currentUser) {
      setLocation("/");
    }
  }, [currentUser, setLocation]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <ChannelSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <MessageFeed />
            <MessageInput />
          </div>
          <div className="hidden sm:block">
            <MemberList />
          </div>
        </div>
      </div>
    </div>
  );
}
