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
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Master the 60-Second Pitch",
      subtitle: "Learn to captivate investors in under a minute",
      price: "$299",
      originalPrice: "$499",
      duration: "6 weeks",
      students: "2,400+",
      rating: 4.9,
      level: "Beginner to Advanced",
      thumbnail:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop",
      instructor: "Sarah Chen",
      instructorTitle: "Ex-YC Partner, Raised $50M+",
      features: [
        "60+ video lessons",
        "Pitch deck templates",
        "1-on-1 feedback sessions",
        "Investor psychology masterclass",
        "Real pitch examples from unicorns",
        "Lifetime access",
      ],
      badge: "BESTSELLER",
      color: "#F5B942",
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
      instructorTitle: "3x Founder, 2 Exits",
      features: [
        "Complete startup roadmap",
        "Legal & incorporation guide",
        "Financial modeling templates",
        "Team building strategies",
        "Product-market fit framework",
        "Fundraising playbook",
      ],
      badge: "NEW",
      color: "#2D7A4F",
    },
    {
      id: 3,
      title: "Pitch Deck Mastery",
      subtitle: "Create decks that close million-dollar rounds",
      price: "$199",
      originalPrice: "$349",
      duration: "4 weeks",
      students: "3,200+",
      rating: 4.9,
      level: "Intermediate",
      thumbnail:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop",
      instructor: "David Park",
      instructorTitle: "Design Lead at Sequoia",
      features: [
        "50+ deck templates",
        "Slide-by-slide breakdown",
        "Design principles for founders",
        "Storytelling frameworks",
        "Investor deck reviews",
        "Figma design files",
      ],
      badge: "POPULAR",
      color: "#F5B942",
    },
    {
      id: 4,
      title: "Investor Relations Pro",
      subtitle: "Build lasting relationships with VCs and angels",
      price: "$399",
      originalPrice: "$599",
      duration: "8 weeks",
      students: "1,200+",
      rating: 4.7,
      level: "Advanced",
      thumbnail:
        "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=800&h=500&fit=crop",
      instructor: "Aisha Kamara",
      instructorTitle: "Former VC, $2B AUM",
      features: [
        "Investor outreach templates",
        "Negotiation tactics",
        "Term sheet deep-dive",
        "Due diligence preparation",
        "Post-funding management",
        "VC network access",
      ],
      badge: "PRO",
      color: "#1B5E3F",
    },
    {
      id: 5,
      title: "Video Pitch Production",
      subtitle: "Film and edit professional pitch videos",
      price: "$149",
      originalPrice: "$249",
      duration: "3 weeks",
      students: "2,800+",
      rating: 4.8,
      level: "Beginner",
      thumbnail:
        "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=500&fit=crop",
      instructor: "Sofia Martinez",
      instructorTitle: "Emmy-Winning Producer",
      features: [
        "Equipment recommendations",
        "Lighting & sound setup",
        "Editing tutorials",
        "Script writing guide",
        "B-roll techniques",
        "Platform optimization",
      ],
      badge: "TRENDING",
      color: "#F5B942",
    },
    {
      id: 6,
      title: "Fundraising Strategy Bundle",
      subtitle: "Complete fundraising system from seed to Series A",
      price: "$799",
      originalPrice: "$1,299",
      duration: "16 weeks",
      students: "900+",
      rating: 5.0,
      level: "All Levels",
      thumbnail:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
      instructor: "Expert Team",
      instructorTitle: "Combined 100+ Years Experience",
      features: [
        "All 5 courses included",
        "Private community access",
        "Monthly live Q&A sessions",
        "Investor introductions",
        "Pitch competition entry",
        "Certificate of completion",
      ],
      badge: "BUNDLE",
      color: "#1B5E3F",
    },
  ];

  const benefits = [
    {
      icon: <HiAcademicCap className="w-14 h-14" />,
      title: "Learn from the Best",
      description:
        "Courses taught by successful founders, VCs, and industry experts",
    },
    {
      icon: <HiTrendingUp className="w-14 h-14" />,
      title: "Proven Results",
      description: "Our students have raised over $500M in funding",
    },
    {
      icon: <HiUsers className="w-14 h-14" />,
      title: "Active Community",
      description: "Join 10,000+ founders in our exclusive network",
    },
    {
      icon: <MdVerified className="w-14 h-14" />,
      title: "Lifetime Access",
      description: "Learn at your own pace with unlimited course access",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Students Enrolled" },
    { value: "$500M+", label: "Capital Raised by Alumni" },
    { value: "4.9/5", label: "Average Rating" },
    { value: "95%", label: "Success Rate" },
  ];

  return (
    <div className="min-h-screen bg-dark-navy text-white">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-dark-navy/80 backdrop-blur-xl border-b border-gold/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link to="/">
            <motion.img
              src="/Logobgremove.jpeg"
              alt="EXPGLO FUND"
              className="h-16 w-auto drop-shadow-[0_0_10px_rgba(245,185,66,0.3)]"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/"
              className="text-gray-300 text-sm font-semibold hover:text-gold transition-colors"
            >
              Home
            </Link>
            <Link to="/courses" className="text-gold text-sm font-semibold">
              Courses
            </Link>
            <a
              href="/#pitches"
              className="text-gray-300 text-sm font-semibold hover:text-gold transition-colors"
            >
              Live Pitches
            </a>
            <a
              href="/#features"
              className="text-gray-300 text-sm font-semibold hover:text-gold transition-colors"
            >
              Features
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <motion.button
                className="px-6 py-3 text-white text-sm font-bold border-2 border-gold/10 rounded-xl hover:border-gold transition-all"
                whileHover={{ scale: 1.05 }}
              >
                Log In
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-gold to-bright-gold text-dark-navy text-sm font-bold rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                Sign Up Free
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-[70vh] flex items-center justify-center px-8 pt-32 pb-24 bg-gradient-to-br from-primary-green/10 to-gold/10 border-b border-gold/10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245, 185, 66, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 185, 66, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            animation: "patternMove 30s linear infinite",
          }}
        ></div>
        <div className="max-w-4xl text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold/10 border border-gold/30 rounded-full mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <HiAcademicCap className="w-5 h-5 text-gold" />
            <span className="text-gold text-xs font-bold tracking-wider">
              EXPGLO FUND ACADEMY
            </span>
          </motion.div>
          <motion.h1
            className="text-7xl font-black leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Master the Art of
            <span className="block bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
              {" "}
              Fundraising
            </span>
          </motion.h1>
          <motion.p
            className="text-2xl text-gray-300 leading-relaxed mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Learn from founders who've raised millions. Get the skills,
            templates, and confidence to pitch like a pro and close your round
            faster.
          </motion.p>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-card-bg/50 rounded-2xl border border-gold/10 backdrop-blur-lg"
              >
                <h3 className="text-4xl font-black bg-gradient-to-br from-gold to-bright-gold bg-clip-text text-transparent mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-300 font-semibold">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-24 px-8 bg-dark-bg">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-black text-center mb-16">
            Why Learn with EXPGLO FUND?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-card-bg border-2 border-gold/10 rounded-3xl p-12 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  borderColor: "rgb(245 185 66)",
                }}
              >
                <div className="text-gold mb-6 inline-block">
                  {benefit.icon}
                </div>
                <h4 className="text-2xl font-bold mb-4">{benefit.title}</h4>
                <p className="text-base text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Courses Grid */}
      <section className="py-24 px-8 bg-dark-navy">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black mb-4">
              Our{" "}
              <span className="bg-gradient-to-r from-gold to-bright-gold bg-clip-text text-transparent">
                Premium Courses
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Choose the perfect course to accelerate your fundraising journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                className="bg-card-bg border-2 border-gold/10 rounded-3xl overflow-hidden relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  borderColor: "rgb(245 185 66)",
                }}
              >
                {course.badge && (
                  <div
                    className="absolute top-6 right-6 px-4 py-2 rounded-xl text-xs font-bold text-dark-navy z-10 backdrop-blur-lg"
                    style={{ background: course.color }}
                  >
                    {course.badge}
                  </div>
                )}

                <div className="relative h-64 overflow-hidden group">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-dark-navy/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <motion.button
                      className="px-8 py-4 bg-gold text-dark-navy text-base font-bold rounded-xl flex items-center gap-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <HiPlay /> Preview Course
                    </motion.button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-primary-green bg-primary-green/10 px-3 py-1.5 rounded-lg">
                      {course.level}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-gold">
                      <HiStar /> {course.rating}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                    {course.subtitle}
                  </p>

                  <div className="mb-6 pb-6 border-b border-gold/10">
                    <h5 className="text-sm font-bold mb-1">
                      {course.instructor}
                    </h5>
                    <p className="text-xs text-gray-400">
                      {course.instructorTitle}
                    </p>
                  </div>

                  <div className="flex gap-6 text-sm text-gray-300 mb-6">
                    <span className="flex items-center gap-2">
                      <HiClock /> {course.duration}
                    </span>
                    <span className="flex items-center gap-2">
                      <HiUsers /> {course.students}
                    </span>
                  </div>

                  <div className="mb-6 space-y-3">
                    {course.features.slice(0, 4).map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <HiCheckCircle className="text-primary-green flex-shrink-0" />{" "}
                        {feature}
                      </div>
                    ))}
                    {course.features.length > 4 && (
                      <p className="text-sm text-gold font-semibold mt-2">
                        +{course.features.length - 4} more features
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gold/10">
                    <div>
                      <span className="text-3xl font-black text-gold">
                        {course.price}
                      </span>
                      <span className="block text-base text-gray-400 line-through">
                        {course.originalPrice}
                      </span>
                    </div>
                    <motion.button
                      className="px-7 py-3.5 bg-gradient-to-r from-primary-green to-secondary-green text-white text-sm font-bold rounded-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Enroll Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 bg-gradient-to-br from-primary-green/10 to-gold/10 border-y border-gold/10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl font-black mb-6">
            Ready to Transform Your Fundraising?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of founders who've mastered the art of pitching and
            raised millions
          </p>
          <motion.button
            className="px-12 py-5 bg-gradient-to-r from-gold to-bright-gold text-dark-navy text-lg font-bold rounded-xl shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse All Courses →
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-bg border-t border-gold/10 py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <img
                src="/Logobgremove.jpeg"
                alt="EXPGLO FUND"
                className="h-14 mb-4 drop-shadow-[0_0_10px_rgba(245,185,66,0.3)]"
              />
              <p className="text-base text-gray-300 leading-relaxed max-w-md">
                Where great ideas meet the capital to change the world.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-bold tracking-wider text-gold mb-4">
                PLATFORM
              </h5>
              <div className="space-y-3">
                <Link
                  to="/"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  For Founders
                </Link>
                <Link
                  to="/"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  For Investors
                </Link>
                <Link
                  to="/courses"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  Courses
                </Link>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-bold tracking-wider text-gold mb-4">
                COMPANY
              </h5>
              <div className="space-y-3">
                <a
                  href="#about"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  About
                </a>
                <a
                  href="#blog"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  Blog
                </a>
                <a
                  href="#careers"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  Careers
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-bold tracking-wider text-gold mb-4">
                LEGAL
              </h5>
              <div className="space-y-3">
                <a
                  href="#privacy"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  Privacy
                </a>
                <a
                  href="#terms"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  Terms
                </a>
                <a
                  href="#security"
                  className="block text-sm text-gray-300 hover:text-gold transition-all hover:translate-x-1"
                >
                  Security
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gold/10 gap-4">
            <p className="text-sm text-gray-400">
              © 2026 EXPGLO FUND, Inc. All rights reserved.
            </p>
            <p className="text-sm text-gray-400">
              Built for founders, backed by conviction.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CoursesPage;
