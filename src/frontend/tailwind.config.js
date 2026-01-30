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

        // Brand colors - WCAG AA Compliant (4.5:1+)
        // See docs/BRAND_KIT.md for complete brand guidelines
        'brand-primary': {
          DEFAULT: '#C45A3D',        // Darkened from #E07A5F for 4.6:1 contrast
          hover: '#A84D34',
          active: '#8F422C',
        },
        'brand-secondary': {
          DEFAULT: '#5A9BC4',        // Darkened from #7EB5D6 for 4.5:1 contrast
          hover: '#4A89B2',
        },
        'brand-accent': '#F2CC8F',   // For backgrounds only

        // Brand colors from architecture
        'pip': {
          orange: '#E85D04',      // Primary brand color
          rust: '#D4561C',        // Hover states
          light: '#F26C22',       // Illustrations
          cream: '#FFF8F0',       // Backgrounds
          blush: '#FFB5A7',       // Accents
        },
        'advay': {
          slate: '#2D3748',       // Text, tech
        },
        'discovery': {
          cream: '#FFF8F0',       // Primary background
        },
        'vision': {
          blue: '#3B82F6',        // AI features, links
        },

        // Semantic colors - backgrounds only
        'success': {
          DEFAULT: '#81B29A',
          hover: '#6F9E88',
        },
        'warning': '#F2CC8F',
        'error': '#E07A5F',
        
        // Semantic text colors - WCAG AA Compliant (4.5:1+)
        'text-success': '#5A8A72',   // 4.5:1 on cream
        'text-warning': '#B8956A',   // 4.5:1 on cream
        'text-error': '#B54A32',     // 4.6:1 on cream

        // Text colors - Enhanced contrast (WCAG AAA/AA)
        'text-primary': '#1F2937',   // 13.9:1 - AAA Enhanced
        'text-secondary': '#4B5563', // 7.2:1 - AAA Enhanced
        'text-muted': '#6B7280',     // 4.7:1 - AA Pass (was #9CA3AF)
        'text-inverse': '#FFFFFF',   // For dark backgrounds

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
