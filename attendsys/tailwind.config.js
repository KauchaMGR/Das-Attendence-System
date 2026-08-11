/**
 * Tailwind config.
 *
 * All custom colors/fonts used throughout the app (e.g. `bg-paper`,
 * `text-stamp-green`, `font-display`) are defined here under `theme.extend`.
 * If a class name doesn't look like a normal Tailwind class, it's defined
 * in this file — search here first.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Background tones — "paper" is the page background, "paper2" a slightly darker card/accent tone
        paper: "#F3EEE2",
        paper2: "#EAE3D2",
        // Text tones
        ink: "#1E2620",
        ink2: "#2B3630",
        rule: "#D9D0B9", // border/divider color, mimics ledger rule-lines
        muted: "#736C58", // secondary/label text
        // "stamp" = the rubber-stamp status colors (present/late/absent)
        stamp: {
          green: "#2F6B4F",
          greenDim: "#2F6B4F1a",
          red: "#AE3B2E",
          redDim: "#AE3B2E1a",
          amber: "#B8842C",
          amberDim: "#B8842C1a",
        },
      },
      fontFamily: {
        display: ["\"Fraunces\"", "serif"], // headings
        body: ["\"IBM Plex Sans\"", "sans-serif"], // body text
        mono: ["\"IBM Plex Mono\"", "monospace"], // labels, numbers, roll numbers
      },
      backgroundImage: {
        // repeating horizontal lines, used behind the hero + as a "ledger" background
        ledger:
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, #D9D0B9 28px)",
      },
      borderRadius: {
        stamp: "3px",
      },
    },
  },
  plugins: [],
};
