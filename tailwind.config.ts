import type { Config } from "tailwindcss";

// Same tokens as the v5 prototype's tailwind.config, with fonts served by next/font.
export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FBFBF8", surface: "#FFFFFE", s2: "#F2F1EC", line: "#E3E1D8", ink: "#17160F",
        muted: "#5D5B52", acc: "#F2C200", edge: "#7A6000", ok: "#1E7F49", crit: "#C2372C",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-text)", "var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: { ctl: "6px", in: "12px", mod: "20px" },
      maxWidth: { page: "1280px" },
    },
  },
  plugins: [],
} satisfies Config;
