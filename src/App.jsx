import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Courses from "./pages/Courses";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  HiVideoCamera,
  HiLightningBolt,
  HiChatAlt2,
  HiPhone,
  HiCheckCircle,
  HiTrendingUp,
  HiCurrencyDollar,
  HiUserGroup,
  HiPlay,
  HiVolumeUp,
  HiVolumeOff,
  HiChevronDown,
  HiEye,
} from "react-icons/hi";
import { MdVerified, MdSpeed } from "react-icons/md";
import { IoRocketSharp } from "react-icons/io5";
import { BsGraphUpArrow } from "react-icons/bs";
import "./App.css";

// Animated Counter Component
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Floating Element Component
function FloatingElement({ children, delay = 0 }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<Courses />} />
    </Routes>
  );
}

function HomePage() {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll();

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .catch((err) => console.log("Autoplay prevented:", err));
    }
  }, []);

  // Sample data
  const pitches = [
    {
      id: 1,
      company: "NovaMed AI",
      founder: "Aisha Kamara",
      category: "HealthTech",
      funding: "$2.5M",
      stage: "Seed",
      description: "AI-powered diagnostics for underserved clinics",
      views: "4.2k",
      thumbnail:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    },
    {
      id: 2,
      company: "GreenChain",
      founder: "Rahul Mehta",
      category: "CleanTech",
      funding: "$5M",
      stage: "Series A",
      description: "Blockchain-verified carbon credit marketplace",
      views: "8.7k",
      thumbnail:
        "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&h=400&fit=crop",
    },
    {
      id: 3,
      company: "EduForge",
      founder: "Sofia Chen",
      category: "EdTech",
      funding: "$1.8M",
      stage: "Pre-Seed",
      description: "Personalized learning paths powered by LLMs",
      views: "3.1k",
      thumbnail:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    },
    {
      id: 4,
      company: "SupplySync",
      founder: "Marcus Webb",
      category: "Logistics",
      funding: "$4M",
      stage: "Seed",
      description: "Real-time supply chain visibility for SMBs",
      views: "6.3k",
      thumbnail:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    },
  ];

  const features = [
    {
      icon: <HiVideoCamera />,
      title: "60-Second Pitches",
      desc: "Quick, impactful video pitches that respect everyone's time",
    },
    {
      icon: <BsGraphUpArrow />,
      title: "Smart Matching",
      desc: "AI-powered investor-founder matching based on interests",
    },
    {
      icon: <HiChatAlt2 />,
      title: "Direct Chat",
      desc: "Connect instantly without cold emails or middlemen",
    },
    {
      icon: <HiPhone />,
      title: "Video Calls",
      desc: "Built-in audio and video calling, fully recorded",
    },
    {
      icon: <MdVerified />,
      title: "Verified Profiles",
      desc: "Every user is vetted for authenticity and credibility",
    },
    {
      icon: <HiLightningBolt />,
      title: "Fast Deals",
      desc: "Close rounds in days, not months",
    },
  ];

  const stats = [
    { value: "2400", label: "Founders Pitching", suffix: "+" },
    { value: "340", label: "Capital Raised", prefix: "$", suffix: "M+" },
    { value: "850", label: "Active Investors", suffix: "+" },
    { value: "12000", label: "Connections Made", suffix: "+" },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      z: 50,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>

      {/* Navigation */}
      <motion.nav
        className="navbar"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="nav-container">
          <motion.div
            className="nav-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src="/Logobgremove.jpeg" alt="EXPGLO FUND" />
          </motion.div>
          <div className="nav-links">
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.1, color: "#F5B942" }}
            >
              How It Works
            </motion.a>
            <Link to="/courses">
              <motion.span whileHover={{ scale: 1.1, color: "#F5B942" }}>
                Courses
              </motion.span>
            </Link>
            <motion.a
              href="#pitches"
              whileHover={{ scale: 1.1, color: "#F5B942" }}
            >
              Live Pitches
            </motion.a>
            <motion.a
              href="#features"
              whileHover={{ scale: 1.1, color: "#F5B942" }}
            >
              Features
            </motion.a>
          </div>
          <div className="nav-actions">
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05, borderColor: "#F5B942" }}
              whileTap={{ scale: 0.95 }}
            >
              Log In
            </motion.button>
            <motion.button
              className="btn-primary"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 40px rgba(245, 185, 66, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up Free
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Video */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          {/* Live Indicator */}
          <motion.div
            className="live-indicator"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.span
              className="live-dot"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="live-text">
              LIVE ON EXPGLO FUND — 2,400+ FOUNDERS PITCHING
            </span>
          </motion.div>

          <div className="hero-grid">
            {/* Left Side - Text Content */}
            <motion.div
              className="hero-text"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 variants={itemVariants}>
                <span className="hero-title-line1">Pitch in</span>
                <motion.span
                  className="hero-title-highlight"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                  60 Seconds.
                </motion.span>
                <span className="hero-title-line2">Fund the Future.</span>
              </motion.h1>

              <motion.p className="hero-description" variants={itemVariants}>
                Skip the old, boring funding process. Upload your 60-second
                pitch video and connect with investors who believe in your
                vision. No more endless meetings, no more waiting months.
              </motion.p>

              <motion.div className="hero-cta" variants={itemVariants}>
                <motion.button
                  className="btn-founder"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 60px rgba(245, 185, 66, 0.4)",
                    y: -5,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>I'm a Founder</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
                <motion.button
                  className="btn-investor"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 60px rgba(45, 122, 79, 0.4)",
                    y: -5,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>I'm an Investor</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </motion.div>

              <motion.p className="hero-note" variants={itemVariants}>
                ✓ Free to join · No credit card required · 5 min setup
              </motion.p>
            </motion.div>

            {/* Right Side - Video Player */}
            <motion.div
              className="hero-video-container"
              initial={{ opacity: 0, x: 100, rotateY: -20 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="video-wrapper"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <video
                  ref={videoRef}
                  className="hero-video"
                  loop
                  muted={isMuted}
                  playsInline
                  onLoadedData={() => setIsVideoLoaded(true)}
                >
                  <source src="/pitchvideo.mp4" type="video/mp4" />
                </video>

                {/* Video Overlay */}
                <div className="video-overlay">
                  <motion.div
                    className="video-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  >
                    <HiVideoCamera style={{ marginRight: "0.5rem" }} />
                    OLD vs NEW Funding
                  </motion.div>

                  {/* Mute/Unmute Button */}
                  <motion.button
                    className="mute-button"
                    onClick={toggleMute}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    title={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? (
                      <HiVolumeOff size={24} />
                    ) : (
                      <HiVolumeUp size={24} />
                    )}
                  </motion.button>
                </div>

                {/* Decorative Elements */}
                <motion.div
                  className="video-glow"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>

              {/* Floating Stats Around Video */}
              <FloatingElement delay={0}>
                <motion.div
                  className="floating-stat stat-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                >
                  <span className="stat-icon">
                    <HiLightningBolt />
                  </span>
                  <span className="stat-text">2x Faster</span>
                </motion.div>
              </FloatingElement>

              <FloatingElement delay={0.5}>
                <motion.div
                  className="floating-stat stat-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.7, type: "spring" }}
                >
                  <span className="stat-icon">
                    <HiCurrencyDollar />
                  </span>
                  <span className="stat-text">$340M Raised</span>
                </motion.div>
              </FloatingElement>

              <FloatingElement delay={1}>
                <motion.div
                  className="floating-stat stat-3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.9, type: "spring" }}
                >
                  <span className="stat-icon">
                    <IoRocketSharp />
                  </span>
                  <span className="stat-text">850+ Investors</span>
                </motion.div>
              </FloatingElement>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span>SCROLL TO EXPLORE</span>
              <HiChevronDown size={20} />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        className="stats-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{
                scale: 1.05,
                y: -10,
                boxShadow: "0 20px 60px rgba(245, 185, 66, 0.2)",
              }}
            >
              <motion.h3
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1 + 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                {stat.prefix}
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </motion.h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Live Pitches Section */}
      <section className="pitches-section" id="pitches">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <HiTrendingUp
              style={{
                display: "inline",
                marginRight: "0.5rem",
                verticalAlign: "middle",
              }}
            />
            LIVE ON PLATFORM
          </motion.p>
          <h2>
            Pitches Investors Are{" "}
            <motion.span
              className="highlight-gold"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Watching Now
            </motion.span>
          </h2>
        </motion.div>

        <motion.div
          className="pitches-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {pitches.map((pitch, index) => (
            <motion.div
              key={pitch.id}
              className="pitch-card"
              variants={cardVariants}
              whileHover="hover"
              custom={index}
            >
              <div className="pitch-thumbnail">
                <img src={pitch.thumbnail} alt={pitch.company} />
                <motion.div
                  className="pitch-play-overlay"
                  whileHover={{ scale: 1.2 }}
                >
                  <svg width="50" height="50" viewBox="0 0 50 50">
                    <circle
                      cx="25"
                      cy="25"
                      r="25"
                      fill="rgba(245, 185, 66, 0.9)"
                    />
                    <path d="M20 15L35 25L20 35V15Z" fill="#0A1628" />
                  </svg>
                </motion.div>
                <div className="pitch-category">{pitch.category}</div>
              </div>
              <div className="pitch-content">
                <h4>{pitch.company}</h4>
                <p className="pitch-founder">{pitch.founder}</p>
                <p className="pitch-funding">
                  {pitch.funding} {pitch.stage}
                </p>
                <p className="pitch-description">{pitch.description}</p>
                <div className="pitch-footer">
                  <span className="pitch-views">
                    <HiEye
                      style={{ display: "inline", marginRight: "0.25rem" }}
                    />{" "}
                    {pitch.views} views
                  </span>
                  <motion.button
                    className="btn-connect"
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Connect →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="view-all-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="btn-view-all"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 40px rgba(245, 185, 66, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            View All 2,400+ Pitches →
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="section-label">
            <HiLightningBolt
              style={{
                display: "inline",
                marginRight: "0.5rem",
                verticalAlign: "middle",
              }}
            />
            PLATFORM FEATURES
          </p>
          <h2>
            Everything You Need to{" "}
            <span className="highlight-gold">Close the Deal</span>
          </h2>
        </motion.div>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -10,
                boxShadow: "0 20px 60px rgba(245, 185, 66, 0.2)",
              }}
            >
              <motion.div
                className="feature-icon"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              >
                {feature.icon}
              </motion.div>
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.section
        className="final-cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="cta-content"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Ready to Change How Deals Get Done?
          </motion.h2>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Join 3,000+ founders and investors already on EXPGLO FUND
          </motion.p>
          <motion.div
            className="cta-buttons"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              className="btn-founder btn-large"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 60px rgba(245, 185, 66, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Pitching Today →
            </motion.button>
            <motion.button
              className="btn-investor btn-large"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 60px rgba(45, 122, 79, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Find Your Next Investment →
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/Logobgremove.jpeg" alt="EXPGLO FUND" />
            <p>Where great ideas meet the capital to change the world.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h5>PLATFORM</h5>
              <a href="#founders">For Founders</a>
              <a href="#investors">For Investors</a>
              <a href="#how">How It Works</a>
            </div>
            <div className="footer-column">
              <h5>COMPANY</h5>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#careers">Careers</a>
            </div>
            <div className="footer-column">
              <h5>LEGAL</h5>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#security">Security</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 EXPGLO FUND, Inc. All rights reserved.</p>
          <p>Built for founders, backed by conviction.</p>
        </div>
      </footer>
    </div>
  );
  )
}

export default App;
