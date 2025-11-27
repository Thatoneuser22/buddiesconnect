import { useState, useRef, useEffect } from "react";
import { Send, Smile, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/chatContext";
import { useToast } from "@/hooks/use-toast";

export function MessageInput() {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, sendTypingStart, sendTypingStop, activeChannel, activeDM, friends, isConnected } = useChat();
  const { toast } = useToast();

  const dmFriend = activeDM ? friends.find(f => f.odId === activeDM) : null;
  const placeholder = activeDM && dmFriend 
    ? `Message @${dmFriend.username}` 
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
    if (!content.trim() || (!activeChannel && !activeDM)) return;
    
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please wait for the connection to be established",
        variant: "destructive",
      });
      return;
    }

    sendMessage(content.trim());
    sendTypingStop();
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (e.target.value.trim()) {
      sendTypingStart();
    } else {
      sendTypingStop();
    }
  };

  const isDisabled = !activeChannel && !activeDM;

  return (
    <div className="px-4 pb-6 pt-2">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 bg-muted rounded-lg p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            disabled={isDisabled}
            data-testid="button-attach-file"
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm py-2.5 px-1 focus:outline-none placeholder:text-muted-foreground min-h-[40px] max-h-32"
            data-testid="input-message"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            disabled={isDisabled}
            data-testid="button-emoji"
          >
            <Smile className="w-5 h-5" />
          </Button>
          
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            disabled={!content.trim() || isDisabled}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
