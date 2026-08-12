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
          // Big Impact Experts palette (replaces the above on new
          // surfaces -- purple/gold above is inherited fork branding,
          // still used by not-yet-migrated pages like SiteHeader).
          navy: "#0944B9",
          orange: "#F26522",
          teal: "#4ECDC4",
          bg: "#F7F8FC",
          // Added for the /membership Sales Page redesign (matches the
          // Claude Design reference closely) -- ink/muted/navyDeep are
          // used repeatedly enough there to warrant real tokens rather
          // than one-off arbitrary hex values scattered through the page.
          ink: "#0B1220",
          muted: "#4A5268",
          navyDeep: "#071A52",
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
