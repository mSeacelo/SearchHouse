/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Verde-azulado: cor da marca SearchHouse
        marca: {
          50: "#effaf8",
          100: "#d7f2ed",
          200: "#b0e4da",
          300: "#7fcfc1",
          400: "#4db3a4",
          500: "#2f988a",
          600: "#237a70",
          700: "#1f625b",
          800: "#1d4f4a",
          900: "#1b423e",
          950: "#0b2725",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        surgir: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        surgir: "surgir 200ms ease-out both",
      },
    },
  },
  plugins: [],
};
