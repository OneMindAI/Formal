module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'latex': ['Computer Modern', 'Times New Roman', 'serif'],
        'mono': ['Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        'liquid-glass': {
          50: 'rgba(255, 255, 255, 0.9)',
          100: 'rgba(255, 255, 255, 0.8)',
          200: 'rgba(255, 255, 255, 0.7)',
          300: 'rgba(255, 255, 255, 0.6)',
          400: 'rgba(255, 255, 255, 0.5)',
          500: 'rgba(255, 255, 255, 0.4)',
          600: 'rgba(255, 255, 255, 0.3)',
          700: 'rgba(255, 255, 255, 0.2)',
          800: 'rgba(255, 255, 255, 0.1)',
          900: 'rgba(255, 255, 255, 0.05)',
        },
        'ios-blue': '#007AFF',
        'ios-gray': {
          50: '#F2F2F7',
          100: '#E5E5EA', 
          200: '#D1D1D6',
          300: '#C7C7CC',
          400: '#8E8E93',
          500: '#636366',
          600: '#48484A',
          700: '#3A3A3C',
          800: '#2C2C2E',
          900: '#1C1C1E',
        }
      },
      backdropBlur: {
        'ios': '20px',
      },
      borderRadius: {
        'ios': '10px',
        'ios-lg': '16px',
      },
      boxShadow: {
        'liquid-glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'ios-light': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'ios-medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'ios-large': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 0.3s ease-in-out',
      },
      keyframes: {
        'glass-shimmer': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}