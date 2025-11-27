import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/chatContext";
import { useToast } from "@/hooks/use-toast";

export function MessageInput() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioName, setAudioName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, activeChannel, replyingTo, setReplyingTo } = useChat();
  const { toast } = useToast();
  const [lastMessageTime, setLastMessageTime] = useState(0);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl && !videoUrl && !audioUrl) return;
    if (!activeChannel) return;

    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      toast({ title: "Please wait", description: "You're sending messages too fast!", variant: "destructive" });
      return;
    }

    setLastMessageTime(now);
    sendMessage(content.trim(), imageUrl, videoUrl, audioUrl, replyingTo?.id, videoName, audioName);
    setContent("");
    setImageUrl("");
    setVideoUrl("");
    setVideoName("");
    setAudioUrl("");
    setAudioName("");
    setReplyingTo(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      let endpoint = "/api/upload/image";
      if (file.type.startsWith("audio/")) {
        endpoint = "/api/upload/audio";
        if (file.size > 25 * 1024 * 1024) {
          toast({ title: "File too large", description: "Max 25MB", variant: "destructive" });
          setIsUploading(false);
          return;
        }
      } else if (file.type.startsWith("video/")) {
        endpoint = "/api/upload/video";
        if (file.size > 50 * 1024 * 1024) {
          toast({ title: "File too large", description: "Max 50MB", variant: "destructive" });
          setIsUploading(false);
          return;
        }
      } else if (file.type.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
          setIsUploading(false);
          return;
        }
      } else {
        toast({ title: "Invalid file", description: "Only images, videos, and audio allowed", variant: "destructive" });
        setIsUploading(false);
        return;
      }

      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();
      
      if (file.type.startsWith("audio/")) {
        setAudioUrl(data.url);
        setAudioName(data.name);
      } else if (file.type.startsWith("video/")) {
        setVideoUrl(data.url);
        setVideoName(data.name);
      } else {
        setImageUrl(data.url);
      }
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isDisabled = !activeChannel || isUploading;

  return (
    <div className="border-t p-3 bg-background">
      {replyingTo && (
        <div className="mb-2 p-2 bg-secondary rounded flex items-center justify-between">
          <div className="text-xs">
            <p className="font-semibold text-blue-500">Replying to {replyingTo.username}</p>
            <p className="text-muted-foreground truncate">{replyingTo.content || "[media]"}</p>
          </div>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {(imageUrl || videoUrl || audioUrl) && (
        <div className="mb-3 flex gap-2 flex-wrap">
          {imageUrl && (
            <div className="relative w-fit">
              <img src={imageUrl} alt="preview" className="h-20 rounded" />
              <button onClick={() => setImageUrl("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs" type="button">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {videoUrl && (
            <div className="relative w-fit">
              <div className="p-2 bg-secondary rounded">
                <p className="text-xs text-muted-foreground mb-1 truncate max-w-xs">{videoName}</p>
                <video src={videoUrl} className="h-20 rounded" />
              </div>
              <button onClick={() => { setVideoUrl(""); setVideoName(""); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs" type="button">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {audioUrl && (
            <div className="relative w-fit">
              <div className="p-2 bg-secondary rounded flex items-center gap-2">
                <span className="text-xs text-muted-foreground truncate max-w-xs">{audioName}</span>
                <audio src={audioUrl} controls className="h-6" />
              </div>
              <button onClick={() => { setAudioUrl(""); setAudioName(""); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs" type="button">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" onChange={handleFileSelect} className="hidden" disabled={isUploading} />
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
          placeholder={isDisabled ? (isUploading ? "Uploading..." : "Select a channel") : "Type a message or paste a link..."}
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-black text-white placeholder-gray-400"
        />

        <Button type="submit" disabled={(!content.trim() && !imageUrl && !videoUrl && !audioUrl) || isDisabled}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
