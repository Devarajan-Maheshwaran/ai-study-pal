module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: { extend: { colors: { background: "rgb(var(--color-background) / <alpha-value>)", card: "rgb(var(--color-card) / <alpha-value>)", primary: "rgb(var(--color-primary) / <alpha-value>)", secondary: "rgb(var(--color-secondary) / <alpha-value>)", text: "rgb(var(--color-text) / <alpha-value>)", muted: "rgb(var(--color-muted) / <alpha-value>)", border: "rgb(var(--color-border) / <alpha-value>)" } } },
  plugins: [],
};