/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101216",
        panel: "#181b22",
        line: "#2a2f3a",
        mint: "#42d392",
        amber: "#f2b84b",
        coral: "#ff6b5f"
      }
    }
  },
  plugins: []
};
