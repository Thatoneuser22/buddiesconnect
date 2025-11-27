import { useState } from "react";
import { Hash, Volume2, Plus, ChevronDown, ChevronRight, Users, Settings, UserPlus } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChannelCategory {
  name: string;
  channels: Channel[];
  isExpanded: boolean;
}

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["text-channels", "voice-channels"]));
  const [newChannelName, setNewChannelName] = useState("");
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const textChannels = channels.filter(c => c.type === "text");
  const voiceChannels = channels.filter(c => c.type === "voice");

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

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
        description: `#${channel.name} is ready to use`,
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

  const handleChannelClick = (channel: Channel) => {
    setActiveChannel(channel);
    setActiveDM(null);
  };

  const handleDMClick = (odId: string) => {
    setActiveDM(odId);
    setActiveChannel(null);
  };

  return (
    <div className="w-60 bg-sidebar flex flex-col h-full border-r border-sidebar-border">
      <div className="h-12 flex items-center px-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sm">ChatterBox</h2>
        <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="mb-2">
            <button
              onClick={() => toggleCategory("text-channels")}
              className="flex items-center w-full px-1 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover-elevate active-elevate-2 rounded"
              data-testid="button-toggle-text-channels"
            >
              {expandedCategories.has("text-channels") ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              Text Channels
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <span
                    className="ml-auto p-0.5 rounded hover-elevate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Text Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="channel-name">Channel Name</Label>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-1">#</span>
                        <Input
                          id="channel-name"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          placeholder="new-channel"
                          data-testid="input-channel-name"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddChannel}
                      disabled={isAddingChannel || !newChannelName.trim()}
                      className="w-full"
                      data-testid="button-create-channel"
                    >
                      {isAddingChannel ? "Creating..." : "Create Channel"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </button>
            {expandedCategories.has("text-channels") && (
              <div className="mt-1 space-y-0.5">
                {textChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelClick(channel)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm hover-elevate active-elevate-2 ${
                      activeChannel?.id === channel.id && !activeDM
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`button-channel-${channel.id}`}
                  >
                    <Hash className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{channel.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {voiceChannels.length > 0 && (
            <div className="mb-2">
              <button
                onClick={() => toggleCategory("voice-channels")}
                className="flex items-center w-full px-1 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover-elevate active-elevate-2 rounded"
              >
                {expandedCategories.has("voice-channels") ? (
                  <ChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 mr-1" />
                )}
                Voice Channels
              </button>
              {expandedCategories.has("voice-channels") && (
                <div className="mt-1 space-y-0.5">
                  {voiceChannels.map((channel) => (
                    <button
                      key={channel.id}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm text-muted-foreground hover-elevate active-elevate-2"
                      data-testid={`button-channel-${channel.id}`}
                    >
                      <Volume2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Separator className="my-2" />

          <div>
            <div className="flex items-center px-1 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="w-3 h-3 mr-1" />
              Direct Messages
            </div>
            <div className="mt-1 space-y-0.5">
              {friends.map((friend) => (
                <button
                  key={friend.odId}
                  onClick={() => handleDMClick(friend.odId)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover-elevate active-elevate-2 ${
                    activeDM === friend.odId
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                  data-testid={`button-dm-${friend.odId}`}
                >
                  <UserAvatar
                    username={friend.username}
                    avatarColor={friend.avatarColor}
                    status={friend.status}
                    size="sm"
                    showStatus
                  />
                  <span className="truncate">{friend.username}</span>
                </button>
              ))}
              {friends.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-2">No friends yet</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {currentUser && (
        <div className="h-14 bg-sidebar-accent/50 flex items-center gap-2 px-2 border-t border-sidebar-border">
          <UserAvatar
            username={currentUser.username}
            avatarColor={currentUser.avatarColor}
            status={currentUser.status}
            size="md"
            showStatus
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.status}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-settings">
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
