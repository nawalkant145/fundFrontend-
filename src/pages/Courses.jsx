import { motion } from "framer-motion";
import {
  HiVideoCamera,
  HiLightningBolt,
  HiCheckCircle,
  HiStar,
  HiUsers,
  HiClock,
  HiAcademicCap,
  HiTrendingUp,
  HiChartBar,
  HiChatAlt2,
  HiDocumentText,
  HiPlay,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { IoRocketSharp } from "react-icons/io5";
import { BsGraphUpArrow, BsTrophy } from "react-icons/bs";
import { Link } from "react-router-dom";
import "./Courses.css";

function Courses() {
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
      icon: <HiAcademicCap />,
      title: "Learn from the Best",
      description:
        "Courses taught by successful founders, VCs, and industry experts",
    },
    {
      icon: <HiTrendingUp />,
      title: "Proven Results",
      description: "Our students have raised over $500M in funding",
    },
    {
      icon: <HiUsers />,
      title: "Active Community",
      description: "Join 10,000+ founders in our exclusive network",
    },
    {
      icon: <MdVerified />,
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
    <div className="courses-page">
      {/* Navigation */}
      <motion.nav
        className="navbar"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <motion.img
              src="/Logobgremove.jpeg"
              alt="EXPGLO FUND"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/courses" className="active">
              Courses
            </Link>
            <a href="/#pitches">Live Pitches</a>
            <a href="/#features">Features</a>
          </div>
          <div className="nav-actions">
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
            >
              Log In
            </motion.button>
            <motion.button className="btn-primary" whileHover={{ scale: 1.05 }}>
              Sign Up Free
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="courses-hero">
        <div className="courses-hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <HiAcademicCap style={{ marginRight: "0.5rem" }} />
            EXPGLO FUND ACADEMY
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Master the Art of
            <span className="highlight-gold"> Fundraising</span>
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Learn from founders who've raised millions. Get the skills,
            templates, and confidence to pitch like a pro and close your round
            faster.
          </motion.p>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="hero-stat">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Why Learn with EXPGLO FUND?</h2>
        </motion.div>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="benefit-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="benefit-icon">{benefit.icon}</div>
              <h4>{benefit.title}</h4>
              <p>{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="courses-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>
            Our <span className="highlight-gold">Premium Courses</span>
          </h2>
          <p>
            Choose the perfect course to accelerate your fundraising journey
          </p>
        </motion.div>

        <div className="courses-grid">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              className="course-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              {course.badge && (
                <div
                  className="course-badge"
                  style={{ background: course.color }}
                >
                  {course.badge}
                </div>
              )}

              <div className="course-thumbnail">
                <img src={course.thumbnail} alt={course.title} />
                <div className="course-overlay">
                  <motion.button
                    className="preview-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <HiPlay /> Preview Course
                  </motion.button>
                </div>
              </div>

              <div className="course-content">
                <div className="course-meta">
                  <span className="course-level">{course.level}</span>
                  <span className="course-rating">
                    <HiStar /> {course.rating}
                  </span>
                </div>

                <h3>{course.title}</h3>
                <p className="course-subtitle">{course.subtitle}</p>

                <div className="course-instructor">
                  <div className="instructor-info">
                    <h5>{course.instructor}</h5>
                    <p>{course.instructorTitle}</p>
                  </div>
                </div>

                <div className="course-stats">
                  <span>
                    <HiClock /> {course.duration}
                  </span>
                  <span>
                    <HiUsers /> {course.students}
                  </span>
                </div>

                <div className="course-features">
                  {course.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <HiCheckCircle /> {feature}
                    </div>
                  ))}
                  {course.features.length > 4 && (
                    <p className="more-features">
                      +{course.features.length - 4} more features
                    </p>
                  )}
                </div>

                <div className="course-footer">
                  <div className="course-price">
                    <span className="current-price">{course.price}</span>
                    <span className="original-price">
                      {course.originalPrice}
                    </span>
                  </div>
                  <motion.button
                    className="btn-enroll"
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
      </section>

      {/* CTA Section */}
      <section className="courses-cta">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Transform Your Fundraising?</h2>
          <p>
            Join thousands of founders who've mastered the art of pitching and
            raised millions
          </p>
          <motion.button
            className="btn-founder btn-large"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse All Courses →
          </motion.button>
        </motion.div>
      </section>

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
              <Link to="/">For Founders</Link>
              <Link to="/">For Investors</Link>
              <Link to="/courses">Courses</Link>
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
}

export default Courses;
