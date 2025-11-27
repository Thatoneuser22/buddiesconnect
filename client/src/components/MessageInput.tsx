import { useState, useRef, useEffect } from "react";
import { Send, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/chatContext";
import { useToast } from "@/hooks/use-toast";

export function MessageInput() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, activeChannel, activeDM, isConnected } = useChat();
  const { toast } = useToast();

  const dmFriend = activeDM ? null : null;
  const placeholder = activeDM 
    ? "Message @friend" 
    : activeChannel 
      ? `Message #${activeChannel.name}` 
      : "Select a channel";

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + "px";
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;
    if (!activeChannel && !activeDM) return;
    
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please wait for the connection to be established",
        variant: "destructive",
      });
      return;
    }

    sendMessage(content.trim(), imageUrl);
    setContent("");
    setImageUrl("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Images must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const isDisabled = !activeChannel && !activeDM;

  return (
    <div className="border-t p-4 bg-background">
      {imageUrl && (
        <div className="mb-3 relative w-fit">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="h-24 rounded border"
          />
          <button
            onClick={() => setImageUrl("")}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            type="button"
            data-testid="button-remove-image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          data-testid="input-image-file"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          data-testid="button-attach"
        >
          <Plus className="w-5 h-5" />
        </Button>
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm py-2 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          data-testid="input-message"
        />
        
        <Button
          type="submit"
          size="icon"
          disabled={(!content.trim() && !imageUrl) || isDisabled}
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
