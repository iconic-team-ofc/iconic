/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#1F1F1F",
        primary:    "#A557F2",
        secondary:  "#BFBFBF",
        text:       "#FFFFFF",
        hover:      "#C17FF5",
        gold:       "#CBA135",
      },
      keyframes: {
        "gradient-pan": {
          "0%,100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      animation: {
        "gradient-pan": "gradient-pan 3s ease infinite",
      },
      backgroundImage: {
        "text-gradient": "linear-gradient(90deg, #A557F2, #C17FF5, #EC4899)",
      },
    },
  },
  plugins: [],
};
F