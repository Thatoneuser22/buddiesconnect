import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from "@/lib/chatContext";
import { apiRequest, queryClient, setCurrentUserId } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import type { User, Channel } from "@shared/schema";

const AVATAR_COLORS = [
  "#5865F2", "#57F287", "#FEE75C", "#EB459E", "#ED4245",
  "#9B59B6", "#3498DB", "#1ABC9C", "#E91E63", "#FF9800"
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { setCurrentUser, setChannels, setActiveChannel, channels } = useChat();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.length < 2) {
      toast({
        title: "Username too short",
        description: "Username must be at least 2 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      const user = await apiRequest<User>("POST", "/api/users", { username: username.trim(), avatarColor });
      
      setCurrentUserId(user.id);
      setCurrentUser(user);
      
      const channelsData = await queryClient.fetchQuery<Channel[]>({
        queryKey: ["/api/channels"],
      });
      setChannels(channelsData);
      const generalChannel = channelsData.find(c => c.name === "general");
      if (generalChannel) {
        setActiveChannel(generalChannel);
      }
      
      setLocation("/chat");
    } catch (error: unknown) {
      toast({
        title: "Failed to join",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Join Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={32}
                  autoFocus
                  data-testid="input-username"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !username.trim()}
                data-testid="button-join"
              >
                {isLoading ? "Joining..." : "Join"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
