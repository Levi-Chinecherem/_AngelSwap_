/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            sciFiBg: '#1A1A2E',
            sciFiAccent: '#FF4C60',
            sciFiText: '#EAEAEA',
            buyColor: '#1D9A6C',  // Green for Buy orders
            sellColor: '#E53E3E',  // Red for Sell orders
        },
    },
  },
  plugins: [],
}

