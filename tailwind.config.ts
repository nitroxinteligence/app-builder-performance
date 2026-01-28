import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./componentes/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--fonte-corpo)", "ui-sans-serif", "system-ui"],
        titulo: ["var(--fonte-titulo)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
