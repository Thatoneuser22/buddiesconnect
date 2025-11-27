import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@/lib/chatContext";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

export function AvatarUpload() {
  const { currentUser, setCurrentUser } = useChat();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
        headers: {
          "x-user-id": currentUser?.id || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const data = await response.json();
      setCurrentUser(data.user);
      
      toast({
        title: "Success",
        description: "Avatar updated!",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentUser) return null;

  const initials = currentUser.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {currentUser.avatarUrl ? (
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.username} />
        ) : null}
        <AvatarFallback style={{ backgroundColor: currentUser.avatarColor }}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          data-testid="input-avatar"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={isUploading}
          data-testid="button-upload-avatar"
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
