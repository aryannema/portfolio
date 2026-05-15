/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        win: {
          bg: "#c0c0c0",
          dark: "#808080",
          darker: "#404040",
          light: "#ffffff",
          blue: "#000080",
          teal: "#008080",
          highlight: "#000080",
        },
        bios: {
          bg: "#000000",
          text: "#aaaaaa",
          yellow: "#ffff00",
          cyan: "#00ffff",
          green: "#00ff00",
        },
      },
      fontFamily: {
        win: ['"MS Sans Serif"', "Arial", "sans-serif"],
        mono: ['"Courier New"', "monospace"],
        vt: ["VT323", "monospace"],
      },
      boxShadow: {
        win: "inset -1px -1px 0 #808080, inset 1px 1px 0 #ffffff",
        "win-inset": "inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff",
        "win-raised": "2px 2px 0 #000000",
      },
      keyframes: {
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        scanline: { "0%": { top: "-5%" }, "100%": { top: "105%" } },
        glitch: {
          "0%, 90%, 100%": { transform: "translate(0)" },
          "92%": { transform: "translate(-2px, 1px)" },
          "94%": { transform: "translate(2px, -1px)" },
        },
        typewriter: { from: { width: "0" }, to: { width: "100%" } },
        fadeIn: { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        scanline: "scanline 6s linear infinite",
        glitch: "glitch 8s infinite",
        fadeIn: "fadeIn 0.3s ease",
      },
    },
  },
  plugins: [],
};
