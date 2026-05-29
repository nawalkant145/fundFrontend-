import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import {
  HiVideoCamera,
  HiLightningBolt,
  HiChatAlt2,
  HiPhone,
  HiCheckCircle,
  HiTrendingUp,
  HiCurrencyDollar,
  HiUserGroup,
  HiVolumeUp,
  HiVolumeOff,
  HiChevronDown,
  HiEye,
} from "react-icons/hi";
import { MdVerified, MdSpeed } from "react-icons/md";
import { IoRocketSharp } from "react-icons/io5";
import { BsGraphUpArrow } from "react-icons/bs";

// Animated Counter Component
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Floating Element Component
function FloatingElement({ children, delay = 0 }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export { AnimatedCounter, FloatingElement };
