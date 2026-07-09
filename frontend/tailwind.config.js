/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3EEE2",
        paper2: "#EAE3D2",
        ink: "#1E2620",
        ink2: "#2B3630",
        rule: "#D9D0B9",
        muted: "#736C58",
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
        display: ["\"Fraunces\"", "serif"],
        body: ["\"IBM Plex Sans\"", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "monospace"],
      },
      backgroundImage: {
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
