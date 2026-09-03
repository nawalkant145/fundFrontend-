import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicNav from "../public/PublicNav";

                                                                                                                                                                                                                        
export default function AuthShell({ children, maxWidth = "max-w-2xl" }) {
  return (
    <div className="min-h-screen bg-white text-[#0A1F14] relative overflow-hidden">
      {                      }
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-[#1B5E3F]/[0.07] rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-[#F5B942]/[0.10] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#2D7A4F]/[0.05] rounded-full blur-[180px]" />
      </div>

      <PublicNav />

      <div className="flex items-center justify-center px-4 pt-28 sm:pt-32 pb-12 min-h-screen">
        <div className={`relative z-10 w-full ${maxWidth}`}>
          <motion.div
            className="bg-white border border-[#1B5E3F]/12 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_30px_80px_-30px_rgba(15,74,46,0.25)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {children}
          </motion.div>

          <Link to="/">
            <motion.p
              className="text-center mt-6 text-[#0A1F14]/55 hover:text-[#1B5E3F] transition-colors text-sm font-semibold"
              whileHover={{ scale: 1.04 }}
            >
              ← Back to home
            </motion.p>
          </Link>
        </div>
      </div>
    </div>
  );
}
