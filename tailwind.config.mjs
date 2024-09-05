/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
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
