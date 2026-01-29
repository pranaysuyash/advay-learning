/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#FDF8F3',
        'bg-secondary': '#E8F4F8',
        'bg-tertiary': '#F5F0E8',

        // Brand colors
        'brand-primary': {
          DEFAULT: '#E07A5F',
          hover: '#C96A52',
          active: '#B55D48',
        },
        'brand-secondary': {
          DEFAULT: '#7EB5D6',
          hover: '#6BA3C5',
        },
        'brand-accent': '#F2CC8F',

        // Semantic colors
        'success': {
          DEFAULT: '#81B29A',
          hover: '#6F9E88',
        },
        'warning': '#F2CC8F',
        'error': '#E07A5F',

        // Text colors - Enhanced contrast
        'text-primary': '#1F2937',
        'text-secondary': '#4B5563',
        'text-muted': '#9CA3AF',
        'text-inverse': '#FFFFFF',

        // UI colors - Sharper borders
        'border': '#D1D5DB',
        'border-strong': '#9CA3AF',
        'border-focus': '#2563EB',
      },
      fontFamily: {
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'display': ['6rem', { lineHeight: '1' }],
        'h1': ['2rem', { lineHeight: '1.3' }],
        'h2': ['1.5rem', { lineHeight: '1.3' }],
        'h3': ['1.25rem', { lineHeight: '1.3' }],
        'body': ['1.125rem', { lineHeight: '1.5' }],
        'small': ['1rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(61, 64, 91, 0.08)',
        'soft-lg': '0 4px 16px rgba(61, 64, 91, 0.12)',
      },
      minWidth: {
        'touch': '60px',
      },
      minHeight: {
        'touch': '60px',
      },
    },
  },
  plugins: [],
};
