import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/chatContext";
import { useToast } from "@/hooks/use-toast";

export function MessageInput() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, activeChannel } = useChat();
  const { toast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl && !videoUrl) return;
    if (!activeChannel) return;

    sendMessage(content.trim(), imageUrl, videoUrl);
    setContent("");
    setImageUrl("");
    setVideoUrl("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast({ title: "Invalid file", description: "Only images and videos allowed", variant: "destructive" });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 50MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        if (isVideo) {
          setVideoUrl(result);
        } else {
          setImageUrl(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const isDisabled = !activeChannel;

  return (
    <div className="border-t p-3 bg-background">
      {imageUrl && (
        <div className="mb-3 relative w-fit">
          <img src={imageUrl} alt="preview" className="h-20 rounded" />
          <button onClick={() => setImageUrl("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs" type="button">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {videoUrl && (
        <div className="mb-3 relative w-fit">
          <video src={videoUrl} className="h-20 rounded" />
          <button onClick={() => setVideoUrl("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs" type="button">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isDisabled}>
          <Paperclip className="w-5 h-5" />
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
          placeholder={isDisabled ? "Select a channel" : "Type a message or paste a link..."}
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-black text-white placeholder-gray-400"
        />

        <Button type="submit" disabled={(!content.trim() && !imageUrl && !videoUrl) || isDisabled}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
