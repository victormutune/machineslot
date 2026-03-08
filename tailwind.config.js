/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        retro: ['RetroPixel', 'monospace'],
        sans: ['Oswald', 'sans-serif'], // Set default sans font to Oswald
      },
    },
  },
  plugins: [],
}
