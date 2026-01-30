import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./componentes/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--fonte-corpo)", "ui-sans-serif", "system-ui"],
        titulo: ["var(--fonte-titulo)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        primaria: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          ativa: "var(--primary-active)",
          suave: "var(--primary-soft)",
        },
        sucesso: {
          DEFAULT: "var(--success)",
          suave: "var(--success-soft)",
        },
        perigo: {
          DEFAULT: "var(--destructive)",
          suave: "var(--danger-soft)",
        },
        aviso: {
          DEFAULT: "var(--warning)",
          suave: "var(--warning-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          suave: "var(--info-soft)",
        },
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      transitionDuration: {
        rapida: "var(--transition-fast)",
        normal: "var(--transition-normal)",
        lenta: "var(--transition-slow)",
        "muito-lenta": "var(--transition-slower)",
      },
      transitionTimingFunction: {
        padrao: "var(--easing-default)",
        entrada: "var(--easing-in)",
        saida: "var(--easing-out)",
      },
    },
  },
  plugins: [],
};

export default config;
