/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#F4EEDD",
        ink: "#1C2333",
        gold: "#B8892B",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        reading: ["Lora", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
