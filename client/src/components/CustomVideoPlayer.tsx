import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface CustomVideoPlayerProps {
  src: string;
  title: string;
}

export function CustomVideoPlayer({ src, title }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen().catch(err => console.error(err));
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={containerRef} className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/50 overflow-hidden">
      <p className="text-xs font-semibold text-purple-300 p-3 truncate">{title}</p>
      
      <div className="relative bg-black group">
        <video
          ref={videoRef}
          src={src}
          className="w-full"
          onClick={togglePlay}
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-purple-900/50 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-2"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-500 hover:bg-purple-600 rounded-full transition"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>

            <span className="text-xs text-purple-300 whitespace-nowrap">{formatTime(currentTime)}</span>
            <span className="text-xs text-purple-300">/</span>
            <span className="text-xs text-purple-300 whitespace-nowrap">{formatTime(duration)}</span>

            <div className="flex-1" />

            <button
              onClick={toggleMute}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-purple-500/20 rounded transition"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-purple-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-purple-300" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-12 h-1 bg-purple-900/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />

            <button
              onClick={toggleFullscreen}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-purple-500/20 rounded transition"
            >
              <Maximize className="w-4 h-4 text-purple-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
