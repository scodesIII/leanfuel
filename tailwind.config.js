/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "App.{tsx,jsx,ts,js}",
    "index.{tsx,jsx,ts,js}",
    "app/**/*.{tsx,jsx,ts,js}",
    "components/**/*.{tsx,jsx,ts,js}",
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B',
        background: '#FFFFFF',
        text: '#1E293B',
      },
    },
  },
  plugins: [],
};
