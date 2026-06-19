import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'v-pink':   '#F0146E',
        'v-purple': '#A445B2',
        'v-gold':   '#FFB800',
        'v-dark':   '#0f0f1a',
        'v-dark2':  '#1a1a2e',
      },
      fontFamily: {
        heading: ['var(--font-outfit)', 'sans-serif'],
        body:    ['var(--font-open-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
