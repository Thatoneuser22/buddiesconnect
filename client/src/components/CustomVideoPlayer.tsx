import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Download, FileVideo } from "lucide-react";

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
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [pitch, setPitch] = useState(0);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.fullscreenElement !== containerRef.current) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
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

  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pitchValue = parseFloat(e.target.value);
    setPitch(pitchValue);
    if (videoRef.current) {
      const pitchRateMap: { [key: number]: number } = {
        "-2": 0.794,
        "-1": 0.891,
        "0": 1,
        "1": 1.122,
        "2": 1.26,
      };
      const rate = pitchRateMap[pitchValue] || 1;
      videoRef.current.playbackRate = playbackRate * rate;
    }
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
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (document.fullscreenElement === containerRef.current && isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
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
    link.download = title || "video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full bg-gradient-to-br from-slate-800 to-purple-800 rounded-lg border border-purple-600 overflow-hidden group transition-all ${
        isPlaying ? "video-playing" : ""
      }`}
    >
      <div className="hidden sm:flex items-center gap-2 p-2 bg-gradient-to-r from-slate-900 to-purple-900/80 border-b border-purple-600">
        <FileVideo className="w-4 h-4 text-purple-300 flex-shrink-0" />
        <p className="text-sm font-medium text-purple-100 truncate flex-1">{title}</p>
      </div>

      <div className="relative bg-black" onMouseMove={handleMouseMove}>
        <video
          ref={videoRef}
          src={src}
          className="w-full cursor-pointer object-contain sm:max-h-96"
          onClick={togglePlay}
        />

        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 sm:p-3 transition-opacity duration-300 pointer-events-none hover:pointer-events-auto ${
          showControls ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 sm:h-1.5 bg-purple-900/50 rounded-full appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300 mb-1 sm:mb-2 pointer-events-auto"
          />

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center hover:opacity-80 transition pointer-events-auto"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-purple-200" />
              ) : (
                <Play className="w-3 h-3 sm:w-4 sm:h-4 text-purple-200 ml-0.5" />
              )}
            </button>

            <span className="text-xs text-purple-200 whitespace-nowrap hidden sm:inline">{formatTime(currentTime)}</span>
            <span className="text-xs text-purple-200 hidden sm:inline">/</span>
            <span className="text-xs text-purple-200 whitespace-nowrap hidden sm:inline">{formatTime(duration)}</span>

            <div className="flex-1" />

            <select
              value={playbackRate}
              onChange={handlePlaybackRateChange}
              className="hidden sm:block text-xs bg-purple-900/60 text-purple-100 rounded px-2 py-1 cursor-pointer border border-purple-600 pointer-events-auto"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>

            <select
              value={pitch}
              onChange={handlePitchChange}
              className="hidden sm:block text-xs bg-purple-900/60 text-purple-100 rounded px-2 py-1 cursor-pointer border border-purple-600 pointer-events-auto"
            >
              <option value="-2">-2 tone</option>
              <option value="-1">-1 tone</option>
              <option value="0">Normal</option>
              <option value="1">+1 tone</option>
              <option value="2">+2 tone</option>
            </select>

            <button
              onClick={toggleMute}
              className="hidden sm:flex flex-shrink-0 w-6 h-6 items-center justify-center hover:opacity-80 transition pointer-events-auto"
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
              className="hidden sm:block w-12 h-1.5 bg-purple-900/50 rounded-full appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300 pointer-events-auto"
            />

            <button
              onClick={toggleFullscreen}
              className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:opacity-80 transition pointer-events-auto"
            >
              <Maximize className="w-3 h-3 sm:w-4 sm:h-4 text-purple-300" />
            </button>

            <button
              onClick={handleDownload}
              className="hidden sm:flex flex-shrink-0 w-6 h-6 items-center justify-center hover:opacity-80 transition pointer-events-auto opacity-0 group-hover:opacity-100"
            >
              <Download className="w-4 h-4 text-purple-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
