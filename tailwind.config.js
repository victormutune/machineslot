/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        supercell: ['SupercellMagic', 'sans-serif'],
        retro: ['RetroPixel', 'monospace'],
        sans: ['SupercellMagic', 'sans-serif'], // Set default sans font to supercell
      },
    },
  },
  plugins: [],
}
