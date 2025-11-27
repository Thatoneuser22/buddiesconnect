import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Download, FileAudio } from "lucide-react";

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
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = title || "audio.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 group hover:bg-slate-750 transition">
      <div className="flex items-start gap-3 mb-2">
        <FileAudio className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{title}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:opacity-80 transition"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-slate-300" />
          ) : (
            <Play className="w-4 h-4 text-slate-300 ml-0.5" />
          )}
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-slate-400 hover:accent-slate-300"
          />
          <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(duration)}</span>
        </div>

        <button
          onClick={toggleMute}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-12 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-slate-400 hover:accent-slate-300"
        />

        <button
          onClick={handleDownload}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition opacity-0 group-hover:opacity-100"
        >
          <Download className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <audio ref={audioRef} src={src} />
    </div>
  );
}
