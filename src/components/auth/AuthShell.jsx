import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Shared layout for all auth pages — animated gradient background,
 * centered logo, glass card.
 */
export default function AuthShell({ children, maxWidth = "max-w-2xl" }) {
  return (
    <div className="min-h-screen bg-dark-navy text-white flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-dark-navy/85" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] animate-gradient-shift opacity-10">
            <div className="absolute inset-0 bg-gradient-radial from-primary-green/30 via-transparent to-transparent" />
            <div
              className="absolute inset-0 bg-gradient-radial from-gold/20 via-transparent to-transparent"
              style={{ left: "60%", top: "60%" }}
            />
          </div>
        </div>
      </div>

      <div className={`relative z-10 w-full ${maxWidth}`}>
        <Link to="/">
          <motion.img
            src="/Logobgremove.jpeg"
            alt="EXPGLO FUND"
            className="h-14 sm:h-16 w-auto mx-auto mb-6 drop-shadow-[0_0_10px_rgba(245,185,66,0.3)]"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          />
        </Link>

        <motion.div
          className="bg-card-bg/60 backdrop-blur-xl border-2 border-gold/20 rounded-3xl p-6 sm:p-8 md:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {children}
        </motion.div>

        <Link to="/">
          <motion.p
            className="text-center mt-6 text-gray-400 hover:text-gold transition-colors text-sm"
            whileHover={{ scale: 1.04 }}
          >
            ← Back to Home
          </motion.p>
        </Link>
      </div>
    </div>
  );
}
