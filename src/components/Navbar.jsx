import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-dark-navy/80 backdrop-blur-xl border-b border-gold/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <motion.img
            src="/Expglo fund logo.jpeg"
            alt="EXPGLO FUND"
            className="h-16 w-auto drop-shadow-[0_0_10px_rgba(245,185,66,0.3)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <motion.a
            href="#how-it-works"
            className="text-gray-300 text-sm font-semibold hover:text-gold transition-colors relative group"
            whileHover={{ scale: 1.1 }}
          >
            How It Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-300"></span>
          </motion.a>

          <Link to="/courses">
            <motion.span
              className="text-gray-300 text-sm font-semibold hover:text-gold transition-colors relative group"
              whileHover={{ scale: 1.1 }}
            >
              Courses
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-300"></span>
            </motion.span>
          </Link>

          <motion.a
            href="#pitches"
            className="text-gray-300 text-sm font-semibold hover:text-gold transition-colors relative group"
            whileHover={{ scale: 1.1 }}
          >
            Live Pitches
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-300"></span>
          </motion.a>

          <motion.a
            href="#features"
            className="text-gray-300 text-sm font-semibold hover:text-gold transition-colors relative group"
            whileHover={{ scale: 1.1 }}
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-300"></span>
          </motion.a>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            className="px-6 py-3 text-white text-sm font-bold border-2 border-gold/10 rounded-xl hover:border-gold transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Log In
          </motion.button>
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-gold to-bright-gold text-dark-navy text-sm font-bold rounded-xl shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up Free
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
