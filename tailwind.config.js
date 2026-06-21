/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slateApp: '#0f172a',
        panel: '#111827',
        accent: '#2563eb'
      },
      boxShadow: {
        panel: '0 10px 30px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};
