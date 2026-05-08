/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        minecraft: ['"Minecraft Five"', 'monospace'],
      },
      colors: {
        accent: 'var(--color-accent)',
        glow: 'var(--color-glow)',
      },
    },
  },
  plugins: [],
}
