import type { Config } from "tailwindcss";

// Design tokens (a black, white and grey palette). Each colour is a CSS variable (defined in src/app/globals.css) so the
// light and dark themes can swap values. "<alpha-value>" keeps classes like border-accent/30 working.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class", // dark styles apply when <html> has the "dark" class
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"), // page background
        surface: token("surface"), // cards and inputs
        ink: token("ink"), // main text
        muted: token("muted"), // secondary text
        line: token("line"), // subtle borders and dividers
        "line-strong": token("line-strong"), // borders of form fields (needs 3:1 contrast)
        accent: token("accent"), // buttons, focus ring, hover borders
        "accent-strong": token("accent-strong"), // button hover
        "accent-soft": token("accent-soft"), // light tint behind accent text
        "accent-text": token("accent-text"), // accent-coloured text and links
        "on-accent": token("on-accent"), // text placed on an accent background
        danger: token("danger"),
        "danger-soft": token("danger-soft"),
        "added-bg": token("added-bg"),
        "removed-bg": token("removed-bg"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
