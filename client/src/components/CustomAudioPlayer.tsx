import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface CustomAudioPlayerProps {
  src: string;
  title: string;
}

export function CustomAudioPlayer({ src, title }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
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
    <div className="w-full p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg border border-blue-500/50">
      <p className="text-xs font-semibold text-blue-300 mb-3 truncate">{title}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-full transition"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-blue-300 whitespace-nowrap">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-xs text-blue-300 whitespace-nowrap">{formatTime(duration)}</span>
        </div>

        <button
          onClick={toggleMute}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-blue-500/20 rounded transition"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-blue-300" />
          ) : (
            <Volume2 className="w-4 h-4 text-blue-300" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-16 h-1 bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <audio ref={audioRef} src={src} />
    </div>
  );
}
