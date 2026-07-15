import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  HiVideoCamera,
  HiChatAlt2,
  HiPhone,
  HiShieldCheck,
  HiCurrencyDollar,
  HiVolumeUp,
  HiVolumeOff,
  HiPlay,
  HiArrowRight,
  HiCheck,
  HiStar,
  HiSparkles,
  HiHeart,
  HiBookmark,
  HiEye,
  HiTrendingUp,
  HiGlobeAlt,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { IoRocketSharp, IoSend } from "react-icons/io5";
import PublicNav from "../components/public/PublicNav";
import PublicFooter from "../components/public/PublicFooter";

/**
 * EXPGLO FUND — premium social-fundraising landing page.
 * Videos under /videos/ tell the story across the page.
 *
 * Brand palette:
 *   green-deep:  #0F4A2E
 *   green:       #1B5E3F
 *   green-soft:  #2D7A4F
 *   gold:        #F5B942
 *   gold-bright: #FFD166
 *   bg:          #FFFFFF
 *   bg-soft:     #FAFAF7
 *   ink:         #0A1F14
 */

// ─── Counter ────────────────────────────────
function Counter({ end, suffix = "", prefix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const t = setInterval(() => {
      v += end / 60;
      if (v >= end) {
        setN(end);
        clearInterval(t);
      } else setN(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Marquee ─────────────────────────────────
function Marquee({ items }) {
  return (
    <div className="overflow-hidden py-2">
      <motion.div
        className="flex gap-3 whitespace-nowrap"
        animate={{ x: [0, -1200] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            className="px-5 py-2.5 bg-white border border-[#1B5E3F]/15 rounded-full text-sm font-semibold text-[#0F4A2E] flex-shrink-0 shadow-sm"
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
    const navigate = useNavigate();
  const industries = [
    "Fintech",
    "HealthTech",
    "Climate",
    "AI / ML",
    "EdTech",
    "SaaS",
    "DeepTech",
    "AgriTech",
    "E-commerce",
    "Logistics",
    "Web3",
    "Consumer",
  ];

  return (
    <div className="min-h-screen bg-white text-[#0A1F14] overflow-x-hidden">
      {/* Soft brand glows */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-[#1B5E3F]/[0.06] rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-[#F5B942]/[0.10] rounded-full blur-[180px]" />
      </div>

      <PublicNav />

      <Hero />
      <IndustriesBar industries={industries} />
      <OldVsNewSection />
      <BentoShowcase />
      <DualValue />
      <GlobalNetworkSection />
      <StatsSection />
      <TestimonialsSection />
      <BigCTA />
      <PublicFooter />
    </div>
  );
}

// ─── HERO — split layout with rotating video carousel ─
const HERO_VIDEOS = [
  {
    src: "/videos/herostory.mp4",
    badge: "✨ EXPGLO FUND · in 60 seconds",
  },
  {
    src: "/pitchvideo.mp4",
    badge: "🔥 OLD vs NEW · how fundraising works now",
  },
];

function Hero() {
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const [muted, setMuted] = useState(true);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Pause/resume based on tab visibility + scroll into view
  useEffect(() => {
    const onTabVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onTabVis);

    const node = containerRef.current;
    if (!node)
      return () => document.removeEventListener("visibilitychange", onTabVis);

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // 25% visible threshold
        setVisible((prev) => (document.hidden ? false : e.isIntersecting));
      },
      { threshold: 0.25 },
    );
    io.observe(node);
    return () => {
      document.removeEventListener("visibilitychange", onTabVis);
      io.disconnect();
    };
  }, []);

  // Sync each <video> element to whether it's the current slide AND visible.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      v.muted = muted;
      if (i === idx && visible) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [idx, visible, muted]);

  // Advance to next slide as soon as current one ends — no gap, no reload
  const handleEnded = () => {
    setIdx((i) => (i + 1) % HERO_VIDEOS.length);
  };

  return (
    <section
      ref={containerRef}
      className="pt-20 pb-12 sm:pt-24 sm:pb-20 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.85fr_1.4fr] gap-10 lg:gap-14 items-center">
        {/* LEFT — copy */}
        <div className="text-center lg:text-left order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#1B5E3F]/15 rounded-full shadow-sm mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B5E3F] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B5E3F]" />
            </span>
            <span className="text-xs font-semibold text-[#0F4A2E]">
              Live · 2,400+ founders · 850+ investors
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-[80px] font-black tracking-tight leading-[1.04] mb-6"
          >
            Fundraising,
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
                in 60 seconds
              </span>
              <motion.svg
                className="absolute -bottom-3 left-0 w-full"
                viewBox="0 0 300 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.6 }}
              >
                <motion.path
                  d="M 5 7 Q 150 -2 295 6"
                  stroke="#F5B942"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#0A1F14]/65 max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed"
          >
            Skip cold emails and 6-month meeting cycles. Upload a short pitch
            video, get discovered by vetted investors, close rounds in days.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-5"
          >
              <Link to="/signup" state={{ role: "founder" }}>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group px-7 py-4 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white text-base font-bold rounded-full shadow-xl shadow-[#1B5E3F]/30 inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-all"
              >
                Start pitching free
                <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/courses">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-4 bg-white text-[#0F4A2E] text-base font-bold rounded-full border-2 border-[#1B5E3F]/15 hover:border-[#1B5E3F]/30 inline-flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
              >
                <HiPlay className="text-[#1B5E3F]" /> Watch a demo
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center lg:justify-start gap-3"
          >
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-9 h-9 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <HiStar key={s} className="w-4 h-4 text-[#F5B942]" />
                ))}
              </div>
              <p className="text-xs font-semibold text-[#0A1F14]/65">
                3,000+ founders & investors
              </p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — video card with both videos preloaded for gapless swap */}
        <div className="order-1 lg:order-2 relative flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative w-full"
          >
            {/* Glow */}
            <div className="absolute -inset-6 bg-gradient-to-br from-[#1B5E3F]/25 via-[#F5B942]/25 to-[#1B5E3F]/15 rounded-[2.5rem] blur-3xl opacity-70" />

            {/* Video card */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#0A1F14] shadow-2xl shadow-[#1B5E3F]/30 ring-1 ring-[#1B5E3F]/10">
              {HERO_VIDEOS.map((v, i) => (
                <video
                  key={v.src}
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={v.src}
                  muted={muted}
                  playsInline
                  preload="auto"
                  onEnded={handleEnded}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                />
              ))}

              {/* Top badge removed — clean video */}

              {/* Mute */}
              <button
                onClick={() => setMuted((m) => !m)}
                className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-white/95 backdrop-blur shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
              >
                {muted ? (
                  <HiVolumeOff className="w-5 h-5 text-[#0F4A2E]" />
                ) : (
                  <HiVolumeUp className="w-5 h-5 text-[#0F4A2E]" />
                )}
              </button>

              {/* Carousel dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {HERO_VIDEOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Show video ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === idx
                        ? "w-7 bg-[#F5B942]"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Industries marquee ─────────────────────
function IndustriesBar({ industries }) {
  return (
    <section className="py-10 bg-[#FAFAF7] border-y border-[#1B5E3F]/8 relative z-10">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-[#0A1F14]/55 font-bold mb-4">
        Founders pitching across
      </p>
      <Marquee items={industries} />
    </section>
  );
}

// ─── OLD vs NEW — uses oldvsnew.mp4 ────────
function OldVsNewSection() {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, []);

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative z-10"
    >
      <div className="max-w-6xl mx-auto">
        <Eyebrow>HOW THINGS CHANGED</Eyebrow>
        <h2 className="text-center text-3xl sm:text-5xl font-black mb-4 leading-tight">
          The old way is{" "}
          <span className="line-through text-[#0A1F14]/30">broken</span>.
          <br />
          <span className="text-[#1B5E3F]">Watch the new way.</span>
        </h2>
        <p className="text-center text-[#0A1F14]/65 text-lg max-w-2xl mx-auto mb-12">
          Cold emails and slide decks took months. Now founders pitch on video,
          investors swipe, deals close in days.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-[#1B5E3F]/15 via-[#F5B942]/20 to-[#1B5E3F]/15 rounded-[2rem] blur-2xl opacity-60" />
          <div className="relative rounded-3xl overflow-hidden bg-[#0A1F14] shadow-2xl shadow-[#1B5E3F]/20 ring-1 ring-[#1B5E3F]/10 aspect-video">
            <video
              ref={ref}
              src="/videos/oldvsnew.mp4"
              muted={muted}
              loop
              playsInline
              autoPlay
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 hidden" />
            <button
              onClick={() => {
                if (ref.current) {
                  ref.current.muted = !muted;
                  setMuted(!muted);
                }
              }}
              className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-white/95 backdrop-blur shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              {muted ? (
                <HiVolumeOff className="w-5 h-5 text-[#0F4A2E]" />
              ) : (
                <HiVolumeUp className="w-5 h-5 text-[#0F4A2E]" />
              )}
            </button>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
          <StepPill
            num="01"
            title="Upload pitch"
            subtitle="60s vertical video"
          />
          <StepPill
            num="02"
            title="Get discovered"
            subtitle="Investors swipe"
          />
          <StepPill num="03" title="Close deal" subtitle="Chat → call → wire" />
        </div>
      </div>
    </section>
  );
}

function StepPill({ num, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 bg-white border border-[#1B5E3F]/12 rounded-2xl p-4 shadow-sm"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-[#F5B942] font-black flex items-center justify-center text-sm">
        {num}
      </div>
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-[#0A1F14]/60">{subtitle}</p>
      </div>
    </motion.div>
  );
}

// ─── BENTO showcase — uses appshowcase.mp4 + investorpov.mp4 ──
function BentoShowcase() {
  return (
    <section
      id="features"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF7] relative z-10"
    >
      <div className="max-w-6xl mx-auto">
        <Eyebrow>WHAT'S INSIDE</Eyebrow>
        <h2 className="text-center text-3xl sm:text-5xl font-black mb-4 leading-tight">
          Everything to <span className="text-[#1B5E3F]">close the round</span>
        </h2>
        <p className="text-center text-[#0A1F14]/65 text-lg max-w-2xl mx-auto mb-14">
          Built for the way deals actually happen now. Video, chat, calls,
          analytics, payments — all in one app.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(220px,auto)]">
          {/* 1. App showcase video — large feature */}
          <BentoCard className="sm:col-span-2 lg:row-span-2 bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] text-white p-6 sm:p-8 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5B942] flex items-center justify-center shadow-lg shadow-[#F5B942]/30">
                  <HiVideoCamera className="w-5 h-5 text-[#0F4A2E]" />
                </div>
                <p className="text-xs uppercase tracking-wider font-bold text-[#F5B942]">
                  The EXPGLO experience
                </p>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-3 leading-tight">
                Vertical video. Real founders. One swipe away.
              </h3>
              <p className="text-sm text-white/75 mb-5 max-w-sm">
                Investors discover real founders in 60 seconds. Like, save,
                comment, DM — instantly.
              </p>
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/30 ring-1 ring-white/10 min-h-[260px]">
                <video
                  src="/videos/appshowcase.mp4"
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
            </div>
          </BentoCard>

          {/* 2. Chat */}
          <BentoCard className="bg-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B5E3F]/15 to-[#1B5E3F]/5 border border-[#1B5E3F]/15 flex items-center justify-center">
                <HiChatAlt2 className="w-5 h-5 text-[#1B5E3F]" />
              </div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#1B5E3F]">
                Direct chat
              </p>
            </div>
            <h3 className="text-xl font-black mb-3">Skip the cold emails</h3>
            <div className="space-y-2 mt-4">
              <ChatBubble
                side="left"
                avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
                text="Loved the pitch. Free to chat?"
              />
              <ChatBubble side="right" text="Yes! Tomorrow 4 PM works 🚀" />
              <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-[#FAFAF7] rounded-full border border-[#1B5E3F]/10">
                <span className="text-xs text-[#0A1F14]/40 flex-1">
                  Type a message…
                </span>
                <IoSend className="w-4 h-4 text-[#1B5E3F]" />
              </div>
            </div>
          </BentoCard>

          {/* 3. Audio + Video calls */}
          <BentoCard className="bg-gradient-to-br from-[#FFF6E0] to-[#FFE9BD] p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B942] flex items-center justify-center shadow-md shadow-[#F5B942]/40">
                <HiPhone className="w-5 h-5 text-[#0F4A2E]" />
              </div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#0F4A2E]/80">
                Audio + video calls
              </p>
            </div>
            <h3 className="text-xl font-black mb-3 text-[#0F4A2E]">
              One-tap Connect
            </h3>
            <p className="text-sm text-[#0A1F14]/70 mb-4">
              No external links. No scheduling chaos.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop"
                  alt=""
                  className="w-10 h-10 rounded-full ring-2 ring-white"
                />
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
                  alt=""
                  className="w-10 h-10 rounded-full ring-2 ring-white"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#0F4A2E]">
                  In call · 12:34
                </p>
                <p className="text-[10px] text-[#0A1F14]/55">
                  HD · end-to-end encrypted
                </p>
              </div>
              <button className="w-9 h-9 rounded-full bg-[#FF3B3B] flex items-center justify-center shadow-md">
                <HiPhone className="w-4 h-4 text-white rotate-[135deg]" />
              </button>
            </div>
          </BentoCard>

          {/* 4. KYC verified */}
          <BentoCard className="bg-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B5E3F]/15 to-[#1B5E3F]/5 border border-[#1B5E3F]/15 flex items-center justify-center">
                <HiShieldCheck className="w-5 h-5 text-[#1B5E3F]" />
              </div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#1B5E3F]">
                Verified
              </p>
            </div>
            <h3 className="text-xl font-black mb-3">Verified profiles</h3>
            <p className="text-sm text-[#0A1F14]/65 mb-4">
              No fake accounts. Real founders, real investors.
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#FAFAF7] rounded-xl border border-[#1B5E3F]/10">
              <MdVerified className="w-5 h-5 text-[#1B5E3F]" />
              <span className="text-sm font-bold flex-1">
                Identity verified
              </span>
              <HiCheck className="w-4 h-4 text-[#1B5E3F]" />
            </div>
          </BentoCard>

          {/* 5. Investor POV — uses investorpov.mp4 */}
          <BentoCard className="sm:col-span-2 bg-[#0A1F14] text-white p-0 overflow-hidden relative min-h-[280px]">
            <video
              src="/videos/investorpov.mp4"
              muted
              loop
              playsInline
              autoPlay
              className="absolute inset-0 w-full h-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0F4A2E]/95 via-[#0F4A2E]/75 to-transparent" />
            <div className="relative h-full p-6 sm:p-8 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5B942] flex items-center justify-center shadow-md shadow-[#F5B942]/30">
                  <HiTrendingUp className="w-5 h-5 text-[#0F4A2E]" />
                </div>
                <p className="text-xs uppercase tracking-wider font-bold text-[#F5B942]">
                  Investor experience
                </p>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2">
                See real founders, not slide decks
              </h3>
              <p className="text-sm text-white/70 max-w-md">
                Swipe through curated pitches in your sectors. AI matches you
                with founders that fit your thesis.
              </p>
            </div>
          </BentoCard>

          {/* 6. AI matching */}
          <BentoCard className="bg-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5B942] to-[#FFD166] flex items-center justify-center shadow-md shadow-[#F5B942]/30">
                <HiSparkles className="w-5 h-5 text-[#0F4A2E]" />
              </div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#1B5E3F]">
                AI matching
              </p>
            </div>
            <h3 className="text-xl font-black mb-2">Smart investor pairing</h3>
            <p className="text-sm text-[#0A1F14]/65 mb-4">
              Find the right investors for your stage and sector.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Fintech", "Series A", "$2M+", "India"].map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-full text-xs font-semibold text-[#0F4A2E]"
                >
                  {t}
                </span>
              ))}
            </div>
          </BentoCard>

          {/* 7. Live analytics */}
          <BentoCard className="bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] text-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B942] flex items-center justify-center shadow-md shadow-[#F5B942]/30">
                <HiTrendingUp className="w-5 h-5 text-[#0F4A2E]" />
              </div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#F5B942]">
                Live analytics
              </p>
            </div>
            <h3 className="text-xl font-black mb-4">Real-time signals</h3>
            <div className="grid grid-cols-3 gap-2">
              <MiniStat icon={HiEye} label="Views" value="12.4k" />
              <MiniStat icon={HiHeart} label="Likes" value="2.4k" />
              <MiniStat icon={HiBookmark} label="Saves" value="488" />
            </div>
          </BentoCard>

          {/* 8. In-app investments */}
          <BentoCard className="bg-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B5E3F]/15 to-[#1B5E3F]/5 border border-[#1B5E3F]/15 flex items-center justify-center">
                <HiCurrencyDollar className="w-5 h-5 text-[#1B5E3F]" />
              </div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#1B5E3F]">
                Invest in-app
              </p>
            </div>
            <h3 className="text-xl font-black mb-3">
              From DM to wire transfer
            </h3>
            <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#1B5E3F]/10">
              <div className="flex justify-between text-xs text-[#0A1F14]/60 mb-1">
                <span>Round progress</span>
                <span className="font-bold text-[#0F4A2E]">$1.4M / $2M</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "70%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-gradient-to-r from-[#1B5E3F] to-[#F5B942] rounded-full"
                />
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      className={`rounded-3xl border border-[#1B5E3F]/10 shadow-sm hover:shadow-xl transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ChatBubble({ side, avatar, text }) {
  if (side === "left") {
    return (
      <div className="flex items-end gap-2">
        <img src={avatar} alt="" className="w-7 h-7 rounded-full" />
        <div className="px-3 py-2 bg-[#FAFAF7] rounded-2xl rounded-bl-md max-w-[70%]">
          <p className="text-xs text-[#0A1F14]">{text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className="px-3 py-2 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white rounded-2xl rounded-br-md max-w-[70%]">
        <p className="text-xs">{text}</p>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15">
      <Icon className="w-4 h-4 text-[#F5B942] mb-1" />
      <p className="text-base font-black">{value}</p>
      <p className="text-[10px] text-white/65">{label}</p>
    </div>
  );
}

// ─── DUAL VALUE — founder vs investor ──────
function DualValue() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <Eyebrow>BUILT FOR BOTH SIDES</Eyebrow>
        <h2 className="text-center text-3xl sm:text-5xl font-black mb-14 leading-tight">
          One platform. <span className="text-[#1B5E3F]">Two superpowers.</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <ValueCard
            accent="green"
            icon={IoRocketSharp}
            tag="FOR FOUNDERS"
            title="Pitch once. Reach 850+ investors."
            points={[
              "60-second video instead of 30-page decks",
              "Real-time analytics — see who's watching",
              "Skip gatekeepers and middlemen",
              "Built-in chat + audio + video calls",
              "Close rounds 6× faster",
            ]}
            cta="Start pitching"
            to="/signup"
          />
          <ValueCard
            accent="gold"
            icon={HiShieldCheck}
            tag="FOR INVESTORS"
            title="See real founders, not slide decks."
            points={[
              "Vetted founders, KYC-verified",
              "Filter by industry, stage, ask",
              "AI matching to your thesis",
              "Browse 2,400+ pitches anywhere",
              "Invest directly through the platform",
            ]}
            cta="Browse pitches"
            to="/signup"
          />
        </div>
      </div>
    </section>
  );
}

// ─── GLOBAL NETWORK — uses globalnetwork.mp4 ──
function GlobalNetworkSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF7] relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left: video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-[#1B5E3F]/20 via-[#F5B942]/15 to-[#1B5E3F]/10 rounded-[2.5rem] blur-3xl opacity-70" />
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#0A1F14] shadow-2xl shadow-[#1B5E3F]/30 ring-1 ring-[#1B5E3F]/10">
              <video
                src="/videos/globalnetwork.mp4"
                muted
                loop
                playsInline
                autoPlay
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur text-[#0F4A2E] text-[11px] font-black tracking-wide rounded-full shadow-lg">
                🌍 LIVE · across 12 countries
              </div>
            </div>
          </motion.div>

          {/* Right: copy */}
          <div className="order-1 lg:order-2">
            <Eyebrow>GLOBAL NETWORK</Eyebrow>
            <h2 className="text-3xl sm:text-5xl font-black mb-5 leading-tight">
              A global stage for{" "}
              <span className="text-[#1B5E3F]">founders & investors</span>
            </h2>
            <p className="text-lg text-[#0A1F14]/65 mb-7 leading-relaxed">
              From Mumbai to New York to Singapore — capital flows where great
              ideas live. Connect across borders, currencies, and time zones.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-7">
              <NetworkPill icon={HiGlobeAlt} label="12 countries" />
              <NetworkPill icon={MdVerified} label="850+ verified investors" />
              <NetworkPill icon={IoRocketSharp} label="2,400+ founders" />
              <NetworkPill icon={HiCurrencyDollar} label="$340M+ raised" />
            </div>
            <Link to="/signup">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-3.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white text-sm font-bold rounded-full shadow-lg shadow-[#1B5E3F]/25 inline-flex items-center gap-2 transition-all"
              >
                Join the network <HiArrowRight />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkPill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 bg-white border border-[#1B5E3F]/10 rounded-2xl shadow-sm">
      <Icon className="w-5 h-5 text-[#1B5E3F]" />
      <span className="text-sm font-semibold text-[#0A1F14]/85">{label}</span>
    </div>
  );
}

// ─── STATS ──────────────────────────────────
function StatsSection() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <Eyebrow>BY THE NUMBERS</Eyebrow>
        <h2 className="text-center text-3xl sm:text-5xl font-black mb-14 leading-tight">
          The platform{" "}
          <span className="text-[#1B5E3F]">founders actually use</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat value={2400} suffix="+" label="Founders pitching" />
          <Stat value={850} suffix="+" label="Verified investors" />
          <Stat value={340} suffix="M+" prefix="$" label="Capital raised" />
          <Stat value={12000} suffix="+" label="Connections made" />
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ──────────────────────────
function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF7] relative z-10">
      <div className="max-w-6xl mx-auto">
        <Eyebrow>STORIES</Eyebrow>
        <h2 className="text-center text-3xl sm:text-5xl font-black mb-14 leading-tight">
          Founders who closed
          <br />
          <span className="text-[#1B5E3F]">in less than 30 days</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          <Testimonial
            quote="Three days after my pitch went live, I had four term sheets. EXPGLO FUND completely changed how I think about fundraising."
            author="Aisha Kamara"
            role="Founder · NovaMed AI"
            avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop"
          />
          <Testimonial
            quote="As an angel, I see 50+ pitches a week here. The video format means I can evaluate deals in minutes, not hours."
            author="Vikram Patel"
            role="Angel · Altva Capital"
            avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
          />
          <Testimonial
            quote="Closed our seed round in 18 days. The video pitch let me share my vision in a way no deck ever could."
            author="Rahul Mehta"
            role="Founder · GreenChain"
            avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"
          />
        </div>
      </div>
    </section>
  );
}

// ─── BIG CTA ───────────────────────────────
function BigCTA() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F4A2E] via-[#1B5E3F] to-[#0F4A2E] text-white relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#F5B942]/15 rounded-full blur-[140px]" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-[#F5B942]/10 rounded-full blur-[160px]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-6 backdrop-blur">
          <HiSparkles className="w-4 h-4 text-[#F5B942]" />
          <span className="text-xs font-bold tracking-wider uppercase">
            Limited beta · Free for the first year
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
          Ready to change how
          <br />
          <span className="bg-gradient-to-r from-[#FFD166] via-[#F5B942] to-[#FFD166] bg-clip-text text-transparent">
            deals get done?
          </span>
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Join 3,000+ founders and investors who are already raising and backing
          the next wave of breakthrough companies.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/signup">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group px-8 py-4 bg-[#F5B942] hover:bg-[#FFD166] text-[#0F4A2E] text-base font-bold rounded-full shadow-xl shadow-[#F5B942]/25 inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-all"
            >
              Start pitching today
              <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white text-base font-bold rounded-full border-2 border-white/25 backdrop-blur inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              I'm already a member
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── helpers ───────────────────────────────
function Eyebrow({ children }) {
  return (
    <p className="text-center text-xs uppercase tracking-[0.2em] font-bold text-[#1B5E3F] mb-4">
      {children}
    </p>
  );
}

function ValueCard({ accent, icon: Icon, tag, title, points, cta, to }) {
  const map = {
    green: {
      bg: "bg-gradient-to-br from-[#0F4A2E] to-[#1B5E3F] text-white",
      ring: "ring-[#1B5E3F]/30",
      iconBg: "bg-[#F5B942]",
      iconShadow: "shadow-[#F5B942]/40",
      iconColor: "text-[#0F4A2E]",
      tag: "text-[#F5B942]",
      check: "text-[#F5B942]",
    },
    gold: {
      bg: "bg-gradient-to-br from-[#FFF6E0] to-[#FFE9BD]",
      ring: "ring-[#F5B942]/40",
      iconBg: "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E]",
      iconShadow: "shadow-[#1B5E3F]/30",
      iconColor: "text-[#F5B942]",
      tag: "text-[#0F4A2E]/70",
      check: "text-[#1B5E3F]",
    },
  }[accent];
  const isGreen = accent === "green";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`relative ${map.bg} ring-1 ${map.ring} rounded-3xl p-7 sm:p-9 shadow-lg hover:shadow-2xl transition-all`}
    >
      <div
        className={`w-14 h-14 rounded-2xl ${map.iconBg} flex items-center justify-center shadow-lg ${map.iconShadow} mb-5`}
      >
        <Icon className={`w-7 h-7 ${map.iconColor}`} />
      </div>
      <p
        className={`text-xs uppercase tracking-[0.18em] font-bold ${map.tag} mb-2`}
      >
        {tag}
      </p>
      <h3 className="text-2xl sm:text-3xl font-black mb-5 leading-tight">
        {title}
      </h3>
      <ul className="space-y-2.5 mb-7">
        {points.map((p) => (
          <li
            key={p}
            className={`flex items-start gap-2.5 ${isGreen ? "text-white/85" : "text-[#0A1F14]/80"}`}
          >
            <HiCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${map.check}`} />
            <span className="text-sm sm:text-base">{p}</span>
          </li>
        ))}
      </ul>
      <Link to={to}>
        <button
          className={`px-6 py-3 ${
            isGreen
              ? "bg-[#F5B942] hover:bg-[#FFD166] text-[#0F4A2E]"
              : "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white"
          } text-sm font-bold rounded-full inline-flex items-center gap-2 shadow-md transition-all`}
        >
          {cta} <HiArrowRight />
        </button>
      </Link>
    </motion.div>
  );
}

function Stat({ value, suffix, prefix, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      className="text-center bg-white border border-[#1B5E3F]/10 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all"
    >
      <p className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-[#0F4A2E] via-[#1B5E3F] to-[#2D7A4F] bg-clip-text text-transparent mb-1.5">
        <Counter end={value} suffix={suffix} prefix={prefix} />
      </p>
      <p className="text-sm font-semibold text-[#0A1F14]/65">{label}</p>
    </motion.div>
  );
}

function Testimonial({ quote, author, role, avatar }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      className="bg-white border border-[#1B5E3F]/10 rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all flex flex-col"
    >
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <HiStar key={s} className="w-4 h-4 text-[#F5B942]" />
        ))}
      </div>
      <p className="text-[#0A1F14]/80 leading-relaxed mb-6 flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-[#1B5E3F]/10">
        <img
          src={avatar}
          alt={author}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1B5E3F]/10"
        />
        <div>
          <p className="font-bold text-sm">{author}</p>
          <p className="text-xs text-[#0A1F14]/60">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
