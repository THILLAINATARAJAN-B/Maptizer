/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Orange Brand Colors
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6600',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        
        // Text Colors (these were missing!)
        text: {
          primary: '#1a1a1a',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
        },
        
        // Surface color (was missing!)
        surface: '#fafafa',
      },
    },
  },
  plugins: [],
}
