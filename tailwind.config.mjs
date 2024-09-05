/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgba(var(--primary))",
          muted: "rgba(var(--primary-muted))",
        },
        secondary: "rgba(var(--secondary))",
        background: "rgba(var(--background))",
        foreground: {
          DEFAULT: "rgba(var(--foreground))",
          muted: "rgba(var(--foreground-muted))",
        },
      },
      fontFamily: {
        JetBrainsMono: "var(--font-jettbrainsMono)",
      },
    },
  },
  plugins: [],
};
