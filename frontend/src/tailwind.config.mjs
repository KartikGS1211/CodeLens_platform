/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      fontSize: {
        xs: [
          "0.75rem",
          { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "400" },
        ],
        sm: [
          "0.875rem",
          { lineHeight: "1.25", letterSpacing: "0.025em", fontWeight: "400" },
        ],
        base: [
          "1rem",
          { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" },
        ],
        lg: [
          "1.125rem",
          { lineHeight: "1.75", letterSpacing: "-0.025em", fontWeight: "400" },
        ],
        xl: [
          "1.25rem",
          { lineHeight: "1.75", letterSpacing: "-0.025em", fontWeight: "500" },
        ],
        "2xl": [
          "1.5rem",
          { lineHeight: "2", letterSpacing: "-0.025em", fontWeight: "600" },
        ],
        "3xl": [
          "1.875rem",
          { lineHeight: "2.25", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        "4xl": [
          "2.25rem",
          { lineHeight: "2.5", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        "5xl": [
          "3rem",
          { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "800" },
        ],
        "6xl": [
          "3.75rem",
          { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "800" },
        ],
        "7xl": [
          "4.5rem",
          { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" },
        ],
        "8xl": [
          "6rem",
          { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" },
        ],
        "9xl": [
          "8rem",
          { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" },
        ],
      },
      fontFamily: {
        heading: ['"Inter Tight"', "Inter", "sans-serif"],
        paragraph: ["Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', "monospace"],
      },
      colors: {
        /* ── New Modern Developer Tool palette ── */
        "cl-bg": "#0A0B0D",
        "cl-surface": "#111318",
        "cl-border": "#1F212B",
        "cl-accent": "#5E6AD2",
        "cl-accent-hover": "#6E7AE2",
        "cl-success": "#3ECF8E",
        "cl-error": "#F45B69",
        "cl-text": "#E4E4E7",
        "cl-muted": "#8B8D98",

        /* ── Keep old tokens mapped to new values for gradual migration ── */
        "neon-teal": "#5E6AD2",
        "deep-space-blue": "#111318",
        charcoal: "#1F212B",
        destructive: "#F45B69",
        "destructive-foreground": "#FFFFFF",
        background: "#0A0B0D",
        secondary: "#5E6AD2",
        foreground: "#E4E4E7",
        "secondary-foreground": "#000000",
        "primary-foreground": "#FFFFFF",
        primary: "#5E6AD2",
      },
      boxShadow: {
        "glow-accent": "0 0 20px rgba(94, 106, 210, 0.15)",
        "glow-success": "0 0 20px rgba(62, 207, 142, 0.15)",
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography"),
  ],
};
