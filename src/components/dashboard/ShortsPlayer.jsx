import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiPlay, HiPause } from "react-icons/hi";

/**
 * Instagram Reels / YouTube Shorts style video player.
 *
 * Tap behavior matches Instagram exactly:
 *   - Tap → toggles play/pause
 *   - Big icon (play OR pause) flashes in the center for ~600ms then fades
 *   - The icon does NOT stay visible while paused; only flashes on the action
 */
export default function ShortsPlayer({
  src,
  poster,
  muted = true,
  active = true,
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [flash, setFlash] = useState(null); // 'play' | 'pause' | null
  const flashTimerRef = useRef(null);

  // Auto-play when this card becomes active
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      setUserPaused(false);
      const tryPlay = v.play();
      if (tryPlay?.catch) tryPlay.catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [active, src]);

  // Pause on tab hidden / window blur
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onVisibility = () => {
      if (document.hidden) {
        v.pause();
        setPlaying(false);
      } else if (active && !userPaused) {
        const p = v.play();
        if (p?.catch) p.catch(() => {});
        setPlaying(true);
      }
    };
    const onBlur = () => {
      v.pause();
      setPlaying(false);
    };
    const onFocus = () => {
      if (active && !document.hidden && !userPaused) {
        const p = v.play();
        if (p?.catch) p.catch(() => {});
        setPlaying(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [active, userPaused]);

  // Mute sync
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // Progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tick = () => {
      if (v.duration) setProgress(v.currentTime / v.duration);
    };
    v.addEventListener("timeupdate", tick);
    return () => v.removeEventListener("timeupdate", tick);
  }, []);

  // Cleanup flash timer
  useEffect(() => () => clearTimeout(flashTimerRef.current), []);

  const showFlash = (kind) => {
    clearTimeout(flashTimerRef.current);
    setFlash(kind);
    flashTimerRef.current = setTimeout(() => setFlash(null), 600);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      setUserPaused(false);
      showFlash("play");
    } else {
      v.pause();
      setPlaying(false);
      setUserPaused(true);
      showFlash("pause");
    }
  };

  // Click on progress bar — seek without toggling play
  const handleSeek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = Math.max(0, Math.min(1, ratio)) * v.duration;
  };

  return (
    <div className="absolute inset-0 select-none">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        muted={muted}
        preload="auto"
        onClick={togglePlay}
        onLoadedData={() => setIsReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 w-full h-full object-cover bg-black cursor-pointer"
      />

      {/* Loader */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
          <div className="w-8 h-8 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
        </div>
      )}

      {/* Flash icon — appears briefly on tap, then fades */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={`${flash}-${Date.now()}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
              {flash === "play" ? (
                <HiPlay className="w-10 h-10 text-white ml-1" />
              ) : (
                <HiPause className="w-10 h-10 text-white" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar — red, bottom */}
      <div
        onClick={handleSeek}
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 cursor-pointer group z-20"
        style={{ touchAction: "manipulation" }}
      >
        <div
          className="h-full bg-red-500 transition-[width] duration-100 ease-linear group-hover:h-1.5"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
