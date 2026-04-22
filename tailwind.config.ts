import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0a1228",
          800: "#0f1a3a",
          700: "#141f3e",
          600: "#1b2a4e",
        },
        teal: {
          500: "#00d9b2",
          400: "#84f5d6",
          600: "#00a896",
          700: "#0F6E56",
        },
        gold: {
          500: "#f5b700",
          600: "#BA7517",
        },
        coral: {
          500: "#ff6b6b",
          600: "#D85A30",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 400ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
