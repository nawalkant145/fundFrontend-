import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import PublicNav from "../components/public/PublicNav";
import PublicFooter from "../components/public/PublicFooter";

const courses = [
  {
    id: 1,
    title: "Master the 60-Second Pitch",
    subtitle: "Captivate investors in under a minute",
    price: "$299",
    originalPrice: "$499",
    duration: "6 weeks",
    students: "2,400+",
    rating: 4.9,
    level: "Beginner → Advanced",
    thumbnail:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop",
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
    badge: "BESTSELLER",
    badgeColor: "bg-[#F5B942] text-[#0F4A2E]",
  },
  {
    id: 2,
    title: "Founder Fundamentals",
    subtitle: "From idea to funded startup in 90 days",
    price: "$499",
    originalPrice: "$799",
    duration: "12 weeks",
    students: "1,800+",
    rating: 4.8,
    level: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
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
    badge: "NEW",
    badgeColor: "bg-[#1B5E3F] text-white",
  },
  {
    id: 3,
    title: "Pitch Deck Mastery",
    subtitle: "Decks that close million-dollar rounds",
    price: "$199",
    originalPrice: "$349",
    duration: "4 weeks",
    students: "3,200+",
    rating: 4.9,
    level: "Intermediate",
    thumbnail:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop",
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
    badge: "POPULAR",
    badgeColor: "bg-[#F5B942] text-[#0F4A2E]",
  },
  {
    id: 4,
    title: "Investor Relations Pro",
    subtitle: "Build lasting relationships with VCs",
    price: "$399",
    originalPrice: "$599",
    duration: "8 weeks",
    students: "1,200+",
    rating: 4.7,
    level: "Advanced",
    thumbnail:
      "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=800&h=500&fit=crop",
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
    badge: "PRO",
    badgeColor: "bg-[#0F4A2E] text-[#F5B942]",
  },
  {
    id: 5,
    title: "Video Pitch Production",
    subtitle: "Film & edit professional pitch videos",
    price: "$149",
    originalPrice: "$249",
    duration: "3 weeks",
    students: "2,800+",
    rating: 4.8,
    level: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=500&fit=crop",
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
    badge: "TRENDING",
    badgeColor: "bg-[#F5B942] text-[#0F4A2E]",
  },
  {
    id: 6,
    title: "Fundraising Strategy Bundle",
    subtitle: "Complete system from seed to Series A",
    price: "$799",
    originalPrice: "$1,299",
    duration: "16 weeks",
    students: "900+",
    rating: 5.0,
    level: "All levels",
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
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

      {/* COURSES */}
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
                <div className="relative h-48 overflow-hidden">
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
                    <button className="px-5 py-2.5 bg-[#F5B942] text-[#0F4A2E] text-sm font-bold rounded-full inline-flex items-center gap-1.5 shadow-lg">
                      <HiPlay /> Preview
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
                    <button className="px-5 py-2.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white text-sm font-bold rounded-full shadow-md transition-all whitespace-nowrap">
                      Enroll
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
