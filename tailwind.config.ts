import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#2D1B69",
          "purple-dark": "#1A0F3E",
          "purple-mid": "#3D2780",
          "purple-light": "#4D35A0",
          gold: "#F0A500",
          "gold-light": "#F5C842",
          "gold-dark": "#C8860A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
