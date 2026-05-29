/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-green": "#1B5E3F",
        "secondary-green": "#2D7A4F",
        gold: "#F5B942",
        "bright-gold": "#FFD166",
        "dark-navy": "#0A1628",
        "dark-bg": "#0F1B2D",
        "card-bg": "#1A2332",
      },
      animation: {
        "gradient-shift": "gradientShift 20s ease infinite",
        "pattern-move": "patternMove 30s linear infinite",
        "pulse-button": "pulseButton 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        gradientShift: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(-5%, -5%) rotate(120deg)" },
          "66%": { transform: "translate(5%, 5%) rotate(240deg)" },
        },
        patternMove: {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(50px, 50px)" },
        },
        pulseButton: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 185, 66, 0.7)" },
          "50%": { boxShadow: "0 0 0 10px rgba(245, 185, 66, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
