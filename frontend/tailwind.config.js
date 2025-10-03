/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",

    // ⛔ exclude AuthPage.jsx
    "!./src/pages/AuthPage.jsx",
    "!./src/pages/ForgotPassword.jsx",
    "!./src/pages/ResetPassword.jsx",

  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
