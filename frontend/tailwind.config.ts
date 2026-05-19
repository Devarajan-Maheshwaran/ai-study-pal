import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["'Inter'", ...fontFamily.sans],
        syne:  ["'Syne'",  ...fontFamily.sans],
        mono:  ["'JetBrains Mono'", ...fontFamily.mono],
      },
      colors: {
        surface: {
          DEFAULT:  "var(--bg)",
          card:     "var(--bg-card)",
          subtle:   "var(--bg-subtle)",
          border:   "var(--border-color)",
        },
        ink: {
          DEFAULT: "var(--text-primary)",
          muted:   "var(--text-muted)",
          faint:   "var(--text-faint)",
        },
        border:     "var(--border-color)",
        background: "var(--bg)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT:    "var(--text-primary)",
          foreground: "var(--bg)",
        },
        secondary: {
          DEFAULT:    "var(--bg-subtle)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT:    "var(--bg-subtle)",
          foreground: "var(--text-muted)",
        },
        card: {
          DEFAULT:    "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT:    "#dc2626",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        sm:   "var(--shadow-sm)",
        md:   "var(--shadow-md)",
        lg:   "var(--shadow-lg)",
        card: "var(--shadow-card)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "logo-scroll": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "fade-up":        "fade-up 0.45s ease-out forwards",
        "fade-in":        "fade-in 0.3s ease-out forwards",
        "shimmer":        "shimmer 2.4s linear infinite",
        "logo-scroll":    "logo-scroll 28s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
