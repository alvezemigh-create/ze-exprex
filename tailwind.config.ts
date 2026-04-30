import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD000",
          dark: "#1A1A1A",
          green: "#00897B",
          red: "#E53935",
          orange: "#FF6B35",
          gray: "#F8F8F8",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "cart-pop": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.18)" },
          "60%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 250ms ease-out",
        "cart-pop": "cart-pop 350ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
