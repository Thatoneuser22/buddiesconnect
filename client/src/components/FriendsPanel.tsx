import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, X, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/lib/chatContext";
import { UserAvatar } from "./UserAvatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Friend } from "@shared/schema";

export function FriendsPanel() {
  const { friends, friendRequests, setFriends, setFriendRequests, setActiveDM, setActiveChannel } = useChat();
  const [addFriendUsername, setAddFriendUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const pendingRequests = friendRequests.filter(r => r.status === "pending");
  const onlineFriends = friends.filter(f => f.status !== "offline");
  const allFriends = friends;

  const handleAddFriend = async () => {
    if (!addFriendUsername.trim()) return;
    
    setIsAdding(true);
    try {
      await apiRequest("POST", "/api/friends/request", { toUsername: addFriendUsername.trim() });
      toast({
        title: "Friend request sent",
        description: `Request sent to ${addFriendUsername}`,
      });
      setAddFriendUsername("");
    } catch (error) {
      toast({
        title: "Failed to send request",
        description: error instanceof Error ? error.message : "User not found",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const friend = await apiRequest<Friend>("POST", `/api/friends/accept/${requestId}`, {});
      setFriends([...friends, friend]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
      toast({
        title: "Friend added",
        description: "You are now friends!",
      });
    } catch (error) {
      toast({
        title: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await apiRequest("POST", `/api/friends/decline/${requestId}`, {});
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    } catch (error) {
      toast({
        title: "Failed to decline request",
        variant: "destructive",
      });
    }
  };

  const handleStartDM = (odId: string) => {
    setActiveDM(odId);
    setActiveChannel(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h2 className="font-semibold">Friends</h2>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={addFriendUsername}
            onChange={(e) => setAddFriendUsername(e.target.value)}
            placeholder="Enter a username"
            className="flex-1"
            data-testid="input-add-friend"
          />
          <Button 
            onClick={handleAddFriend} 
            disabled={isAdding || !addFriendUsername.trim()}
            data-testid="button-add-friend"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        </div>
      </div>

      <Tabs defaultValue="online" className="flex-1 flex flex-col">
        <div className="px-6 pt-2">
          <TabsList>
            <TabsTrigger value="online" data-testid="tab-online-friends">
              Online
              {onlineFriends.length > 0 && (
                <Badge variant="secondary" className="ml-2">{onlineFriends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all-friends">
              All
              {allFriends.length > 0 && (
                <Badge variant="secondary" className="ml-2">{allFriends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending-requests">
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="online" className="mt-0 px-6 py-4">
            {onlineFriends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No friends online</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {onlineFriends.map((friend, index) => (
                    <motion.div
                      key={friend.odId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        delay: index * 0.05
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                      data-testid={`friend-card-${friend.odId}`}
                    >
                      <UserAvatar
                        username={friend.username}
                        avatarColor={friend.avatarColor}
                        status={friend.status}
                        size="lg"
                        showStatus
                      />
                      <div className="flex-1">
                        <p className="font-medium">{friend.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{friend.status}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartDM(friend.odId)}
                        data-testid={`button-message-${friend.odId}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-0 px-6 py-4">
            {allFriends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No friends yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add friends using their username</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {allFriends.map((friend, index) => (
                    <motion.div
                      key={friend.odId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        delay: index * 0.05
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                      data-testid={`friend-card-${friend.odId}`}
                    >
                      <UserAvatar
                        username={friend.username}
                        avatarColor={friend.avatarColor}
                        status={friend.status}
                        size="lg"
                        showStatus
                      />
                      <div className="flex-1">
                        <p className="font-medium">{friend.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{friend.status}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartDM(friend.odId)}
                        data-testid={`button-message-${friend.odId}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-0 px-6 py-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {pendingRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        delay: index * 0.05
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card"
                      data-testid={`request-card-${request.id}`}
                    >
                      <UserAvatar
                        username={request.fromUsername}
                        avatarColor="#5865F2"
                        size="lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{request.fromUsername}</p>
                        <p className="text-xs text-muted-foreground">Incoming Friend Request</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="text-status-online"
                          data-testid={`button-accept-${request.id}`}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeclineRequest(request.id)}
                          className="text-destructive"
                          data-testid={`button-decline-${request.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
