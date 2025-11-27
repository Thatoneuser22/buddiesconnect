import { useState } from "react";
import { Hash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from "@/lib/chatContext";
import { UserAvatar } from "./UserAvatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Channel } from "@shared/schema";

export function ChannelSidebar() {
  const { 
    currentUser, 
    channels, 
    activeChannel,
    setActiveChannel,
    setChannels,
    friends,
    setActiveDM,
    activeDM,
  } = useChat();
  const [newChannelName, setNewChannelName] = useState("");
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const textChannels = channels.filter(c => c.type === "text");

  const handleAddChannel = async () => {
    if (!newChannelName.trim()) return;
    
    setIsAddingChannel(true);
    try {
      const channel = await apiRequest<Channel>("POST", "/api/channels", { 
        name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
        type: "text"
      });
      setChannels([...channels, channel]);
      setNewChannelName("");
      setDialogOpen(false);
      toast({
        title: "Channel created",
        description: `#${channel.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to create channel",
        variant: "destructive",
      });
    } finally {
      setIsAddingChannel(false);
    }
  };

  return (
    <div className="w-64 flex flex-col border-r h-full bg-background">
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg">ChatterBox</h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Channels</h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="channel-name">Channel Name</Label>
                      <Input
                        id="channel-name"
                        placeholder="general"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddChannel();
                          }
                        }}
                      />
                    </div>
                    <Button 
                      onClick={handleAddChannel} 
                      disabled={isAddingChannel || !newChannelName.trim()}
                      className="w-full"
                    >
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-1">
              {textChannels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => {
                    setActiveChannel(channel);
                    setActiveDM(null);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${
                    activeChannel?.id === channel.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  data-testid={`button-channel-${channel.id}`}
                >
                  <Hash className="w-4 h-4" />
                  {channel.name}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-sm mb-2">Friends</h3>
            <div className="space-y-1">
              {friends.map(friend => (
                <button
                  key={friend.odId}
                  onClick={() => {
                    setActiveDM(friend.odId);
                    setActiveChannel(null);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${
                    activeDM === friend.odId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  data-testid={`button-friend-${friend.odId}`}
                >
                  <UserAvatar
                    username={friend.username}
                    avatarColor={friend.avatarColor}
                    size="sm"
                  />
                  <span className="truncate">{friend.username}</span>
                  <div className={`w-2 h-2 rounded-full ml-auto flex-shrink-0 ${friend.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <UserAvatar
            username={currentUser?.username || ""}
            avatarColor={currentUser?.avatarColor || ""}
            size="sm"
          />
          <span className="text-sm truncate flex-1">{currentUser?.username}</span>
        </div>
      </div>
    </div>
  );
}
