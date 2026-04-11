import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Periwinkle-palette baseret på Neglebiksen-logo
        rose: {
          25: "#F5F5FD",
          50: "#EDEDFC",
          100: "#DCDCF8",
          200: "#C4C4F0",
          300: "#A8A8E4",
          400: "#8B8BE8",
          500: "#7474D4",
          600: "#5E5EC0",
          700: "#4A4AAC",
          800: "#383898",
          900: "#2E2E5E",
        },
        accent: {
          DEFAULT: "#F0F07A",
          dark: "#D8D85A",
          light: "#F7F7AA",
        },
        sand: {
          DEFAULT: "#F0F0FA",
          dark: "#E2E2F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
