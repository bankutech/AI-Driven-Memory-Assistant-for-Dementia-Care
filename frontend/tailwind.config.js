/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nyala: {
          primary: '#0C49A2',
          text: '#32373c',
          bg: '#f8fafc',
          gray: '#e2e8f0',
          dark: '#1e293b'
        },
        brand: {
          50: '#f0f4f9',
          100: '#e1e9f4',
          200: '#c3d3e9',
          300: '#a5bcde',
          400: '#87a6d3',
          500: '#698fc8',
          600: '#4b79bd',
          700: '#0C49A2',
          800: '#093a82',
          900: '#062b61'
        },
        leaf: {
          50: '#f0f9f4',
          100: '#e1f4e9',
          200: '#c3e9d3',
          300: '#a5debd',
          400: '#87d3a7',
          500: '#69c891',
          600: '#4bbd7b',
          700: '#0ca249',
          800: '#09823a',
          900: '#06612b'
        }
      },
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out forwards',
      }
    }
  },
  plugins: []
};
