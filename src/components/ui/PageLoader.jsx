import { motion } from "framer-motion";

                                                                                                                                                                                                                                                           
export default function PageLoader({ variant = "fullscreen", text }) {
  if (variant === "inline") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner size="md" />
        {text && (
          <p className="text-sm text-[#0A1F14]/55 font-medium">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-5">
      {          }
      <motion.img
        src="/Expglo fund logo.jpeg"
        alt="EXPGLO FUND"
        className="h-12 w-auto mix-blend-multiply"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      />

      {             }
      <Spinner size="lg" />

      {                           }
      {text && (
        <motion.p
          className="text-sm text-[#0A1F14]/55 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

function Spinner({ size = "md" }) {
  const sizeClass =
    size === "lg" ? "w-10 h-10" : size === "md" ? "w-7 h-7" : "w-5 h-5";
  return (
    <div
      className={`${sizeClass} rounded-full border-[3px] border-[#1B5E3F]/15 border-t-[#1B5E3F] animate-spin`}
    />
  );
}

                                                                  
export function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#1B5E3F]/8 rounded-2xl overflow-hidden"
        >
          {                         }
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 bg-gray-200 rounded" />
              <div className="h-2.5 w-48 bg-gray-100 rounded" />
            </div>
          </div>
          {                   }
          <div className="px-4 pb-3 space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
          </div>
          {                             }
          <div className="w-full aspect-[5/7] max-h-[400px] bg-gray-100" />
          {                      }
          <div className="flex items-center gap-4 p-4">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

                                                                    
export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-gray-100">
          <div className="aspect-[9/16]" />
          <div className="p-2.5 space-y-1.5">
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
            <div className="h-2.5 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
