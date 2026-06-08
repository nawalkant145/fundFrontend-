import { useRef, useEffect } from "react";

/**
 * 6-digit OTP input — light theme with auto-advance and paste support.
 */
export default function OtpInput({ value = "", onChange, length = 6 }) {
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setDigit = (idx, ch) => {
    const next = digits.slice();
    next[idx] = ch;
    onChange(next.join("").trim());
  };

  const handleChange = (idx, e) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    if (!v) {
      setDigit(idx, " ");
      return;
    }
    setDigit(idx, v);
    if (idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx].trim() && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < length - 1)
      refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      const focusIdx = Math.min(pasted.length, length - 1);
      refs.current[focusIdx]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx].trim()}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0F4A2E] focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none transition-all shadow-sm"
        />
      ))}
    </div>
  );
}
