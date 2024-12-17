/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [

  ],
  theme: {
    extend: {
    },
  },
  plugins: [
    daisyui,
  ],
  variants: {
    extend: {
      opacity: ['responsive', 'hover', 'focus', 'active', 'group-hover'],
    },
  },
  daisyui: {
    themes: false,
    darkTheme: false,
  },
}

