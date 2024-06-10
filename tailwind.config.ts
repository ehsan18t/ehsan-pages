import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgba(var(--primary))",
        secondary: "rgba(var(--secondary))",
        background: "rgba(var(--background))",
        foreground: "rgba(var(--foreground))",
      },
      fontFamily: {
        JetBrainsMono: "var(--font-jettbrainsMono)",
      },
    },
  },
  plugins: [],
};
export default config;
