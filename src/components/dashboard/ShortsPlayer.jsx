import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiPlay, HiPause, HiHeart } from "react-icons/hi";

/**
 * Instagram Reels / YouTube Shorts style video player.
 *
 * Tap behavior matches Instagram:
 *   - Single tap → toggles play/pause (300ms delay to detect double-tap)
 *   - Double tap → fires onDoubleTap (parent uses this to like) + heart burst
 *   - Big icon (play OR pause) flashes for ~600ms on single tap, then fades
 */
export default function ShortsPlayer({
  src,
  poster,
  muted = true,
  active = true,
  onDoubleTap,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [flash, setFlash] = useState(null); // 'play' | 'pause' | null
  const [hearts, setHearts] = useState([]); // burst hearts at tap location
  const flashTimerRef = useRef(null);
  const lastTapRef = useRef(0);
  const tapTimerRef = useRef(null);

  const prevSrcRef = useRef(src);

  // Auto-play when this card becomes active, resetting currentTime ONLY on src change
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (prevSrcRef.current !== src) {
      prevSrcRef.current = src;
      v.currentTime = 0;
      setUserPaused(false);
    }

    if (active) {
      if (!userPaused) {
        const tryPlay = v.play();
        if (tryPlay?.catch) tryPlay.catch(() => {});
        setPlaying(true);
      }
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [active, src, userPaused]);

  // Seamlessly resume playback when returning to visible tab if active & not userPaused
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onVisibility = () => {
      if (!document.hidden && active && !userPaused && v.paused) {
        const p = v.play();
        if (p?.catch) p.catch(() => {});
        setPlaying(true);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
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

  // Cleanup timers
  useEffect(
    () => () => {
      clearTimeout(flashTimerRef.current);
      clearTimeout(tapTimerRef.current);
    },
    [],
  );

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

  // Spawn a burst heart at the tap position (Insta double-tap behavior)
  const burstHeart = (clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const id = `${Date.now()}-${Math.random()}`;
    setHearts((arr) => [...arr, { id, x, y }]);
    setTimeout(() => {
      setHearts((arr) => arr.filter((h) => h.id !== id));
    }, 1000);
  };

  // Tap handler: discriminates single vs double tap.
  // We delay single-tap action by 280ms to see if a second tap arrives.
  const handleTap = (e) => {
    const now = Date.now();
    const since = now - lastTapRef.current;
    lastTapRef.current = now;

    if (since < 280) {
      // Double tap detected
      clearTimeout(tapTimerRef.current);
      burstHeart(
        e.clientX ?? e.touches?.[0]?.clientX ?? 0,
        e.clientY ?? e.touches?.[0]?.clientY ?? 0,
      );
      onDoubleTap?.();
      return;
    }

    // Schedule single-tap action
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      togglePlay();
    }, 280);
  };

  // Click on progress bar — seek
  const handleSeek = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = Math.max(0, Math.min(1, ratio)) * v.duration;
  };

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full min-w-0 min-h-0 select-none p-0 m-0 border-0 rounded-none shadow-none bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        muted={muted}
        preload="auto"
        onClick={handleTap}
        onLoadedData={() => setIsReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 w-full h-full object-cover bg-black cursor-pointer p-0 m-0 border-0 rounded-none shadow-none"
      />

      {/* Loader */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
          <div className="w-8 h-8 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
        </div>
      )}

      {/* Single-tap flash icon */}
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

      {/* Double-tap heart burst — anchored at tap point */}
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, scale: 0.3, y: 0, rotate: -15 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.4, 1.2, 1],
              y: [0, -20, -40, -90],
              rotate: [-15, 0, 5, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute pointer-events-none z-30"
            style={{
              left: h.x - 50,
              top: h.y - 50,
            }}
          >
            <HiHeart className="w-24 h-24 text-red-500 drop-shadow-[0_0_24px_rgba(239,68,68,0.7)]" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Single EXPGLO Gold Reel Progress Bar */}
      <div
        onClick={handleSeek}
        className="absolute bottom-2 left-3 right-3 h-1 bg-white/20 rounded-full cursor-pointer group z-20 overflow-hidden"
        style={{ touchAction: "manipulation" }}
        title="Seek video"
      >
        <div
          className="h-full bg-[#F5B942] rounded-full transition-[width] duration-100 ease-linear group-hover:bg-[#e0a838]"
          style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
        />
      </div>
    </div>
  );
}
