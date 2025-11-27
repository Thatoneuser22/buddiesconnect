import { useState, useRef, useEffect } from "react";
import { Send, Smile, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/chatContext";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function MessageInput() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    sendTypingStop();
    setContent("");
    setImageUrl("");
  };

  const handleEmojiSelect = (emojiObject: any) => {
    setContent(prev => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      toast({
        title: "Image attached",
        description: "Your image is ready to send",
      });
    };
    reader.readAsDataURL(file);
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
    <div className="px-4 pb-6 pt-2 space-y-2">
      {imageUrl && (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => setImageUrl("")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 bg-muted rounded-lg p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            disabled={isDisabled}
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-attach-file"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
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
          
          <Popover open={showEmoji} onOpenChange={setShowEmoji}>
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <EmojiPicker onEmojiClick={handleEmojiSelect} width={320} height={400} />
            </PopoverContent>
          </Popover>
          
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            disabled={(!content.trim() && !imageUrl) || isDisabled}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
