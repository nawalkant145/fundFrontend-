import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  HiAcademicCap,
  HiTrendingUp,
  HiUsers,
  HiClock,
  HiStar,
  HiCheckCircle,
  HiPlay,
  HiArrowRight,
  HiSparkles,
  HiX,
  HiBookOpen,
  HiShieldCheck,
  HiLockClosed,
  HiCreditCard,
  HiCheck,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import PublicNav from "../components/public/PublicNav";
import PublicFooter from "../components/public/PublicFooter";
import { useAuth } from "../context/AuthContext";

const courses = [
  {
    id: 1,
    title: "Master the 60-Second Pitch",
    subtitle: "Captivate investors in under a minute",
    price: "$299",
    priceNumber: 299,
    originalPrice: "$499",
    duration: "6 weeks",
    students: "2,400+",
    rating: 4.9,
    level: "Beginner → Advanced",
    thumbnail:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop",
    videoUrl: "/pitchvideo.mp4",
    instructor: "Sarah Chen",
    instructorTitle: "Ex-YC Partner · raised $50M+",
    features: [
      "60+ video lessons",
      "Pitch deck templates",
      "1-on-1 feedback",
      "Investor psychology",
      "Real unicorn examples",
      "Lifetime access",
    ],
    syllabus: [
      {
        title: "Module 1: The 60-Second Hook",
        lessons: [
          "Why 60 Seconds Matters",
          "Crafting Your Elevator Statement",
          "The 3-Second Attention Grabber",
        ],
      },
      {
        title: "Module 2: Storytelling & Metrics",
        lessons: [
          "Framing the Problem & Solution",
          "Traction Metrics Investors Care About",
          "Structuring the Ask",
        ],
      },
      {
        title: "Module 3: Delivery & Body Language",
        lessons: [
          "Voice Modulation & Tone",
          "Camera Presence & Framing",
          "Handling Q&A Under Pressure",
        ],
      },
      {
        title: "Module 4: Real Pitch Teardowns",
        lessons: ["Analyzing 5 Unicorn Pitches", "Common Pitfalls & Mistakes to Avoid"],
      },
    ],
    badge: "BESTSELLER",
    badgeColor: "bg-[#F5B942] text-[#0F4A2E]",
  },
  {
    id: 2,
    title: "Founder Fundamentals",
    subtitle: "From idea to funded startup in 90 days",
    price: "$499",
    priceNumber: 499,
    originalPrice: "$799",
    duration: "12 weeks",
    students: "1,800+",
    rating: 4.8,
    level: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
    videoUrl: "/videos/appshowcase.mp4",
    instructor: "Marcus Webb",
    instructorTitle: "3× Founder · 2 exits",
    features: [
      "Complete startup roadmap",
      "Legal & incorporation",
      "Financial modelling",
      "Team building",
      "PMF framework",
      "Fundraising playbook",
    ],
    syllabus: [
      {
        title: "Module 1: Validation & PMF",
        lessons: [
          "Idea Validation Framework",
          "Customer Interview Playbook",
          "Building an MVP in 14 Days",
        ],
      },
      {
        title: "Module 2: Legal & Equity",
        lessons: [
          "Incorporation & Cap Table Setup",
          "Co-founder Agreements & Vesting",
          "SAFE Notes vs Priced Rounds",
        ],
      },
      {
        title: "Module 3: Financial Modeling",
        lessons: [
          "5-Year Projections Spreadsheet",
          "Unit Economics & CAC/LTV",
          "Burn Rate Management",
        ],
      },
    ],
    badge: "NEW",
    badgeColor: "bg-[#1B5E3F] text-white",
  },
  {
    id: 3,
    title: "Pitch Deck Mastery",
    subtitle: "Decks that close million-dollar rounds",
    price: "$199",
    priceNumber: 199,
    originalPrice: "$349",
    duration: "4 weeks",
    students: "3,200+",
    rating: 4.9,
    level: "Intermediate",
    thumbnail:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop",
    videoUrl: "/videos/herostory.mp4",
    instructor: "David Park",
    instructorTitle: "Design Lead · Sequoia",
    features: [
      "50+ deck templates",
      "Slide-by-slide breakdown",
      "Design principles",
      "Storytelling frameworks",
      "Live deck reviews",
      "Figma files included",
    ],
    syllabus: [
      {
        title: "Module 1: The 10 Essential Slides",
        lessons: [
          "Problem, Solution & Market Size",
          "Traction Slide Design Secrets",
          "The Team Slide That Converts",
        ],
      },
      {
        title: "Module 2: Visual Storytelling",
        lessons: [
          "Typography & Color Hierarchy",
          "Data Visualization & Charts",
          "Formatting for Mobile & PDF",
        ],
      },
    ],
    badge: "POPULAR",
    badgeColor: "bg-[#F5B942] text-[#0F4A2E]",
  },
  {
    id: 4,
    title: "Investor Relations Pro",
    subtitle: "Build lasting relationships with VCs",
    price: "$399",
    priceNumber: 399,
    originalPrice: "$599",
    duration: "8 weeks",
    students: "1,200+",
    rating: 4.7,
    level: "Advanced",
    thumbnail:
      "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=800&h=500&fit=crop",
    videoUrl: "/videos/globalnetwork.mp4",
    instructor: "Aisha Kamara",
    instructorTitle: "Former VC · $2B AUM",
    features: [
      "Outreach templates",
      "Negotiation tactics",
      "Term sheet deep-dive",
      "Due diligence prep",
      "Post-funding management",
      "VC network access",
    ],
    syllabus: [
      {
        title: "Module 1: Warm Introductions & Cold Email",
        lessons: [
          "Mapping Your Ideal Investor Profile",
          "Cold Email Templates That Get 60% Reply Rate",
          "Leveraging Mutual Connections",
        ],
      },
      {
        title: "Module 2: Term Sheet Negotiation",
        lessons: [
          "Understanding Valuation & Dilution",
          "Liquidation Preferences & Governance",
          "Creating FOMO in Your Round",
        ],
      },
    ],
    badge: "PRO",
    badgeColor: "bg-[#0F4A2E] text-[#F5B942]",
  },
  {
    id: 5,
    title: "Video Pitch Production",
    subtitle: "Film & edit professional pitch videos",
    price: "$149",
    priceNumber: 149,
    originalPrice: "$249",
    duration: "3 weeks",
    students: "2,800+",
    rating: 4.8,
    level: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=500&fit=crop",
    videoUrl: "/videos/investorpov.mp4",
    instructor: "Sofia Martinez",
    instructorTitle: "Emmy-winning producer",
    features: [
      "Equipment guide",
      "Lighting & sound",
      "Editing tutorials",
      "Script writing",
      "B-roll techniques",
      "Platform optimization",
    ],
    syllabus: [
      {
        title: "Module 1: Studio Setup on a Budget",
        lessons: [
          "Smartphone Camera Optimization",
          "3-Point Lighting Setup",
          "Audio Gear & Noise Cancellation",
        ],
      },
      {
        title: "Module 2: Editing & Post-Production",
        lessons: [
          "Cutting Your Pitch Video in CapCut/Premiere",
          "Adding Subtitles & Motion Graphics",
          "Exporting for EXPGLO FUND Platform",
        ],
      },
    ],
    badge: "TRENDING",
    badgeColor: "bg-[#F5B942] text-[#0F4A2E]",
  },
  {
    id: 6,
    title: "Fundraising Strategy Bundle",
    subtitle: "Complete system from seed to Series A",
    price: "$799",
    priceNumber: 799,
    originalPrice: "$1,299",
    duration: "16 weeks",
    students: "900+",
    rating: 5.0,
    level: "All levels",
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
    videoUrl: "/mockvideo/pitch1.mp4",
    instructor: "Expert team",
    instructorTitle: "100+ years combined experience",
    features: [
      "All 5 courses",
      "Private community",
      "Monthly live Q&As",
      "Investor introductions",
      "Pitch competition entry",
      "Certificate",
    ],
    syllabus: [
      {
        title: "Module 1: Complete Academy Curriculum",
        lessons: [
          "Includes Access to Courses 1 Through 5",
          "Private Monthly Masterminds with VCs",
          "Direct Introductions to EXPGLO Angel Network",
        ],
      },
    ],
    badge: "BUNDLE",
    badgeColor: "bg-[#0F4A2E] text-[#F5B942]",
  },
];

const benefits = [
  {
    icon: HiAcademicCap,
    title: "Learn from the best",
    description: "Successful founders, VCs, and industry experts.",
  },
  {
    icon: HiTrendingUp,
    title: "Proven results",
    description: "Our students have raised over $500M in funding.",
  },
  {
    icon: HiUsers,
    title: "Active community",
    description: "Join 10,000+ founders in our exclusive network.",
  },
  {
    icon: MdVerified,
    title: "Lifetime access",
    description: "Learn at your own pace, no expiry.",
  },
];

const stats = [
  { value: "10,000+", label: "Students enrolled" },
  { value: "$500M+", label: "Capital raised by alumni" },
  { value: "4.9/5", label: "Average rating" },
  { value: "95%", label: "Success rate" },
];

export default function CoursesPage() {
  const navigate = useNavigate();
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.user;
  } catch {
    currentUser = null;
  }

  // Modals state
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [selectedEnroll, setSelectedEnroll] = useState(null);
  const [enrollingState, setEnrollingState] = useState("idle"); // 'idle' | 'processing' | 'success'
  const [activeModule, setActiveModule] = useState(0);

  const handleEnrollClick = (course) => {
    setSelectedPreview(null);
    setSelectedEnroll(course);
    setEnrollingState("idle");
  };

  const handleConfirmEnrollment = () => {
    setEnrollingState("processing");
    setTimeout(() => {
      setEnrollingState("success");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white text-[#0A1F14] overflow-x-hidden">
      {/* Soft brand glows */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-[#1B5E3F]/[0.06] rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-[#F5B942]/[0.10] rounded-full blur-[180px]" />
      </div>

      <PublicNav />

      {/* HERO */}
      <section className="pt-32 sm:pt-40 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#1B5E3F]/15 rounded-full shadow-sm mb-6"
          >
            <HiAcademicCap className="w-4 h-4 text-[#1B5E3F]" />
            <span className="text-xs font-bold text-[#0F4A2E] tracking-wider uppercase">
              EXPGLO FUND Academy
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.04] mb-6"
          >
            Master the art of
            <br />
            <span className="bg-gradient-to-r from-[#1B5E3F] via-[#2D7A4F] to-[#1B5E3F] bg-clip-text text-transparent">
              fundraising
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#0A1F14]/65 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Learn from founders who've raised millions. Get the skills,
            templates, and confidence to pitch like a pro and close your round
            faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white border border-[#1B5E3F]/10 rounded-2xl p-5 sm:p-6 shadow-sm"
              >
                <p className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-[#0F4A2E] via-[#1B5E3F] to-[#2D7A4F] bg-clip-text text-transparent mb-1">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#0A1F14]/65">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAF7] border-y border-[#1B5E3F]/8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.2em] font-bold text-[#1B5E3F] mb-3">
            WHY EXPGLO FUND ACADEMY
          </p>
          <h2 className="text-center text-3xl sm:text-5xl font-black mb-12 leading-tight">
            Built by founders,{" "}
            <span className="text-[#1B5E3F]">for founders</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#1B5E3F]/10 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-[#1B5E3F]/25 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B5E3F]/15 to-[#1B5E3F]/5 border border-[#1B5E3F]/15 flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-[#1B5E3F]" />
                </div>
                <h3 className="text-lg font-black mb-1.5">{b.title}</h3>
                <p className="text-sm text-[#0A1F14]/65 leading-relaxed">
                  {b.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES GRID */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.2em] font-bold text-[#1B5E3F] mb-3">
            COURSES
          </p>
          <h2 className="text-center text-3xl sm:text-5xl font-black mb-3 leading-tight">
            Choose your path to <span className="text-[#1B5E3F]">funded</span>
          </h2>
          <p className="text-center text-[#0A1F14]/65 text-lg max-w-2xl mx-auto mb-14">
            Pick a single course or grab the bundle. Lifetime access, all of it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (i % 3) * 0.08 }}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-3xl overflow-hidden border border-[#1B5E3F]/10 shadow-sm hover:shadow-2xl hover:border-[#1B5E3F]/25 transition-all flex flex-col"
              >
                <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => { setSelectedPreview(c); setActiveModule(0); }}>
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${c.badgeColor} shadow-md`}
                  >
                    {c.badge}
                  </div>
                  <div className="absolute inset-0 bg-[#0A1F14]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPreview(c);
                        setActiveModule(0);
                      }}
                      className="px-5 py-2.5 bg-[#F5B942] hover:bg-[#FFD166] text-[#0F4A2E] text-sm font-bold rounded-full inline-flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                    >
                      <HiPlay className="w-4 h-4" /> Preview Course
                    </button>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#1B5E3F] bg-[#1B5E3F]/10 px-2.5 py-1 rounded-full">
                      {c.level}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#F5B942]">
                      <HiStar /> {c.rating}
                    </span>
                  </div>

                  <h3 className="text-xl font-black mb-1.5 leading-tight">
                    {c.title}
                  </h3>
                  <p className="text-sm text-[#0A1F14]/65 mb-4 leading-relaxed">
                    {c.subtitle}
                  </p>

                  <div className="pb-4 mb-4 border-b border-[#1B5E3F]/10">
                    <p className="text-sm font-bold">{c.instructor}</p>
                    <p className="text-xs text-[#0A1F14]/55">
                      {c.instructorTitle}
                    </p>
                  </div>

                  <div className="flex gap-4 text-xs text-[#0A1F14]/65 mb-4">
                    <span className="flex items-center gap-1.5">
                      <HiClock className="w-3.5 h-3.5" /> {c.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HiUsers className="w-3.5 h-3.5" /> {c.students}
                    </span>
                  </div>

                  <ul className="space-y-1.5 mb-5">
                    {c.features.slice(0, 4).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-[#0A1F14]/75"
                      >
                        <HiCheckCircle className="w-4 h-4 text-[#1B5E3F] flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {c.features.length > 4 && (
                      <li className="text-xs font-bold text-[#1B5E3F] pl-6">
                        + {c.features.length - 4} more
                      </li>
                    )}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-[#1B5E3F]/10 flex items-end justify-between gap-3">
                    <div>
                      <span className="text-2xl font-black text-[#0F4A2E]">
                        {c.price}
                      </span>
                      <span className="block text-xs text-[#0A1F14]/45 line-through">
                        {c.originalPrice}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEnrollClick(c)}
                      className="px-5 py-2.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white text-sm font-bold rounded-full shadow-md transition-all active:scale-95 whitespace-nowrap"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COURSE PREVIEW MODAL ───────────────────────── */}
      <AnimatePresence>
        {selectedPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPreview(null)}
              className="fixed inset-0 bg-[#0A1F14]/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B5E3F]/10 bg-[#FAFAF7]">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedPreview.badgeColor}`}>
                    {selectedPreview.badge}
                  </span>
                  <h3 className="font-black text-lg text-[#0A1F14] truncate max-w-md">
                    {selectedPreview.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPreview(null)}
                  className="w-9 h-9 rounded-full bg-white border border-[#1B5E3F]/15 flex items-center justify-center text-[#0A1F14]/70 hover:text-[#0A1F14] transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1">
                {/* Video Player */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-lg border border-[#1B5E3F]/15">
                  <video
                    controls
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                    poster={selectedPreview.thumbnail}
                    className="w-full h-full object-cover"
                  >
                    <source src={selectedPreview.videoUrl} type="video/mp4" />
                    <source src="/pitchvideo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#1B5E3F]/5 border border-[#1B5E3F]/10 text-center">
                  <div>
                    <span className="text-xs text-[#0A1F14]/50 block">Rating</span>
                    <span className="text-base font-black text-[#F5B942] flex items-center justify-center gap-1">
                      <HiStar /> {selectedPreview.rating}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0A1F14]/50 block">Duration</span>
                    <span className="text-base font-black text-[#0F4A2E]">{selectedPreview.duration}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0A1F14]/50 block">Students</span>
                    <span className="text-base font-black text-[#0F4A2E]">{selectedPreview.students}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#0A1F14]/50 block">Price</span>
                    <span className="text-base font-black text-[#0F4A2E]">{selectedPreview.price}</span>
                  </div>
                </div>

                {/* Syllabus */}
                <div>
                  <h4 className="font-black text-lg mb-3 flex items-center gap-2 text-[#0A1F14]">
                    <HiBookOpen className="w-5 h-5 text-[#1B5E3F]" />
                    Course Syllabus & Curriculum
                  </h4>
                  <div className="space-y-3">
                    {selectedPreview.syllabus?.map((mod, idx) => (
                      <div
                        key={mod.title}
                        className="border border-[#1B5E3F]/15 rounded-xl overflow-hidden bg-white"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveModule(activeModule === idx ? -1 : idx)}
                          className="w-full px-4 py-3 bg-[#FAFAF7] flex items-center justify-between font-bold text-sm text-[#0F4A2E] hover:bg-[#1B5E3F]/5 transition-colors text-left"
                        >
                          <span>{mod.title}</span>
                          <span className="text-xs font-semibold text-[#0A1F14]/50">
                            {mod.lessons.length} lessons
                          </span>
                        </button>
                        {activeModule === idx && (
                          <div className="p-4 border-t border-[#1B5E3F]/10 space-y-2 bg-white">
                            {mod.lessons.map((lesson) => (
                              <div key={lesson} className="flex items-center gap-2.5 text-xs text-[#0A1F14]/80">
                                <HiPlay className="w-3.5 h-3.5 text-[#1B5E3F] flex-shrink-0" />
                                <span>{lesson}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructor Details */}
                <div className="p-4 rounded-2xl border border-[#1B5E3F]/10 bg-[#FAFAF7] flex items-center gap-4">
                  <img
                    src={selectedPreview.thumbnail}
                    alt={selectedPreview.instructor}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#1B5E3F]/20"
                  />
                  <div>
                    <h5 className="font-bold text-sm">{selectedPreview.instructor}</h5>
                    <p className="text-xs text-[#0A1F14]/60">{selectedPreview.instructorTitle}</p>
                    <p className="text-xs text-[#1B5E3F] font-semibold mt-1">Lead Instructor · EXPGLO FUND Academy</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-[#1B5E3F]/10 bg-[#FAFAF7] flex items-center justify-between gap-4">
                <div>
                  <span className="text-2xl font-black text-[#0F4A2E]">{selectedPreview.price}</span>
                  <span className="text-xs text-[#0A1F14]/45 block">Lifetime Access</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleEnrollClick(selectedPreview)}
                  className="px-7 py-3 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white text-sm font-bold rounded-full shadow-xl transition-all flex items-center gap-2"
                >
                  Enroll Now <HiArrowRight />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── COURSE ENROLLMENT MODAL ────────────────────── */}
      <AnimatePresence>
        {selectedEnroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEnroll(null)}
              className="fixed inset-0 bg-[#0A1F14]/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-8 p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setSelectedEnroll(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FAFAF7] border border-[#1B5E3F]/15 flex items-center justify-center text-[#0A1F14]/70 hover:text-[#0A1F14] transition-colors z-10"
              >
                <HiX className="w-5 h-5" />
              </button>

              {enrollingState === "success" ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <HiCheck className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-black text-[#0F4A2E]">
                    Enrollment Successful!
                  </h3>
                  <p className="text-sm text-[#0A1F14]/70 max-w-xs mx-auto">
                    You have unlocked lifetime access to <span className="font-bold text-[#1B5E3F]">{selectedEnroll.title}</span>.
                  </p>
                  <div className="p-4 bg-[#FAFAF7] rounded-2xl border border-[#1B5E3F]/10 text-left text-xs space-y-1.5 text-[#0A1F14]/80">
                    <p className="flex items-center gap-1.5 font-semibold text-[#1B5E3F]">
                      <HiShieldCheck className="w-4 h-4" /> Payment authorized securely
                    </p>
                    <p className="flex items-center gap-1.5">
                      <HiBookOpen className="w-4 h-4 text-[#1B5E3F]" /> Access via your student dashboard
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnroll(null);
                        navigate(currentUser ? "/app" : "/signup");
                      }}
                      className="w-full py-3 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white font-bold text-sm rounded-full shadow-lg transition-all"
                    >
                      {currentUser ? "Go to Dashboard" : "Create Account to Start Learning"}
                    </button>
                  </div>
                </div>
              ) : enrollingState === "payment" ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1B5E3F] bg-[#1B5E3F]/10 px-2.5 py-1 rounded-full">
                      Step 2: Payment Gateway
                    </span>
                    <h3 className="text-2xl font-black mt-2 text-[#0A1F14]">
                      Secure Checkout
                    </h3>
                    <p className="text-xs text-[#0A1F14]/65 mt-1">
                      Choose your preferred payment method below.
                    </p>
                  </div>

                  {/* Payment Tabs */}
                  <div className="grid grid-cols-3 gap-2 p-1 bg-[#FAFAF7] border border-[#1B5E3F]/15 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveModule(0)} // reuse state for active payment tab
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        activeModule === 0
                          ? "bg-[#1B5E3F] text-white shadow-sm"
                          : "text-[#0A1F14]/75 hover:bg-[#1B5E3F]/5"
                      }`}
                    >
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule(1)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        activeModule === 1
                          ? "bg-[#1B5E3F] text-white shadow-sm"
                          : "text-[#0A1F14]/75 hover:bg-[#1B5E3F]/5"
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule(2)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        activeModule === 2
                          ? "bg-[#1B5E3F] text-white shadow-sm"
                          : "text-[#0A1F14]/75 hover:bg-[#1B5E3F]/5"
                      }`}
                    >
                      Netbanking
                    </button>
                  </div>

                  {/* Payment Forms */}
                  {activeModule === 0 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1F14]/80 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          maxLength="19"
                          required
                          className="w-full px-3 py-2.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-sm focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#0A1F14]/80 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            maxLength="5"
                            required
                            className="w-full px-3 py-2.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-sm focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0A1F14]/80 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength="3"
                            required
                            className="w-full px-3 py-2.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-sm focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : activeModule === 1 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1F14]/80 mb-1">
                          UPI ID / VPA
                        </label>
                        <input
                          type="text"
                          placeholder="username@okaxis"
                          required
                          className="w-full px-3 py-2.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-sm focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-[#0A1F14]/50 leading-relaxed">
                        A payment request will be sent to your UPI app. Please open the app and authorize payment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-[#0A1F14]/80">
                        Select Bank
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-sm focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none font-medium">
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEnrollingState("idle")}
                      className="px-5 py-3 text-xs text-[#0A1F14]/75 font-bold rounded-full border border-[#1B5E3F]/15 hover:border-[#1B5E3F]/45 transition-colors bg-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmEnrollment}
                      className="flex-1 py-3 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white text-sm font-bold rounded-full shadow-lg flex items-center justify-center gap-2"
                    >
                      <HiLockClosed className="w-4 h-4 text-[#F5B942]" /> Pay {selectedEnroll.price} Securely
                    </button>
                  </div>
                </div>
              ) : enrollingState === "processing" ? (
                <div className="text-center py-10 space-y-5">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-[#1B5E3F]/10 border-t-[#1B5E3F] animate-spin" />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <HiLockClosed className="w-6 h-6 text-[#1B5E3F] animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0F4A2E]">
                      Connecting to gateway...
                    </h4>
                    <p className="text-xs text-[#0A1F14]/55 mt-1 max-w-xs mx-auto">
                      Please do not close this window or click back. We are securing your transaction details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1B5E3F] bg-[#1B5E3F]/10 px-2.5 py-1 rounded-full">
                      Step 1: Checkout Overview
                    </span>
                    <h3 className="text-2xl font-black mt-2 text-[#0A1F14]">
                      {selectedEnroll.title}
                    </h3>
                    <p className="text-xs text-[#0A1F14]/60 mt-1">
                      {selectedEnroll.subtitle}
                    </p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#1B5E3F]/10 space-y-2.5">
                    <div className="flex justify-between text-xs text-[#0A1F14]/70">
                      <span>Course Price</span>
                      <span className="font-bold">{selectedEnroll.price}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#0A1F14]/70">
                      <span>Instant Discount</span>
                      <span className="font-bold text-emerald-600">-{selectedEnroll.originalPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#0A1F14]/70">
                      <span>Access Type</span>
                      <span className="font-bold text-[#1B5E3F]">Lifetime Access</span>
                    </div>
                    <div className="border-t border-[#1B5E3F]/10 pt-2 flex justify-between text-base font-black text-[#0F4A2E]">
                      <span>Total Due</span>
                      <span>{selectedEnroll.price}</span>
                    </div>
                  </div>

                  {/* Guarantee & Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#0F4A2E]">
                      <HiShieldCheck className="w-4 h-4 text-[#F5B942]" />
                      <span>30-Day 100% Money Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#0A1F14]/60">
                      <HiLockClosed className="w-4 h-4 text-[#1B5E3F]" />
                      <span>Secure Instant Access · Certificate Included</span>
                    </div>
                  </div>

                  {/* Account state alert */}
                  {!currentUser && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      <strong>Note:</strong> You are checking out as a guest. You will be prompted to complete your student profile after confirmation.
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollingState("payment");
                      setActiveModule(0); // Card tab as default
                    }}
                    className="w-full py-3.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white font-bold text-base rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <HiCreditCard className="w-5 h-5" />
                    Complete Enrollment ({selectedEnroll.price})
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CTA */}
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
              30-day money-back guarantee
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
            Ready to{" "}
            <span className="bg-gradient-to-r from-[#FFD166] via-[#F5B942] to-[#FFD166] bg-clip-text text-transparent">
              transform
            </span>{" "}
            your fundraising?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join 10,000+ founders who've mastered the art of pitching and raised
            millions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group px-8 py-4 bg-[#F5B942] hover:bg-[#FFD166] text-[#0F4A2E] text-base font-bold rounded-full shadow-xl shadow-[#F5B942]/25 inline-flex items-center justify-center gap-2 w-full sm:w-auto transition-all"
              >
                Start learning today
                <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white text-base font-bold rounded-full border-2 border-white/25 backdrop-blur inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Back to home
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
