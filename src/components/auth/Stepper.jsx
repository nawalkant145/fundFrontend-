import { motion } from "framer-motion";
import { HiCheck } from "react-icons/hi";

export default function Stepper({ steps, current }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((label, idx) => {
          const isDone = idx < current;
          const isActive = idx === current;
          return (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-shrink-0">
                <motion.div
                  initial={false}
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                    isDone
                      ? "bg-[#1B5E3F] text-white border-[#1B5E3F]"
                      : isActive
                        ? "bg-white text-[#1B5E3F] border-[#1B5E3F] shadow-md shadow-[#1B5E3F]/15"
                        : "bg-white text-[#0A1F14]/40 border-[#1B5E3F]/15"
                  }`}
                >
                  {isDone ? <HiCheck className="w-5 h-5" /> : idx + 1}
                </motion.div>
                <span
                  className={`text-xs mt-2 font-semibold hidden sm:block ${
                    isActive
                      ? "text-[#0F4A2E]"
                      : isDone
                        ? "text-[#1B5E3F]"
                        : "text-[#0A1F14]/45"
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-[#1B5E3F]/10 relative overflow-hidden rounded">
                  <motion.div
                    initial={false}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-y-0 left-0 bg-[#1B5E3F]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
