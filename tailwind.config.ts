import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        herb: "#2f6f4e",
        tomato: "#cf3f2e",
        cream: "#fbfaf4"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 33, 27, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;

