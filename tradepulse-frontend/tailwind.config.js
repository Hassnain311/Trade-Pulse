/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tp: {
          bg:          '#0B0C10',
          'bg-2':      '#0F1116',
          card:        '#13151C',
          'card-2':    '#1A1D27',
          'card-3':    '#1E2130',
          border:      '#252836',
          'border-2':  '#2E3246',
          accent:      '#00D4FF',
          'accent-2':  '#0096BE',
          'accent-bg': 'rgba(0,212,255,0.08)',
          green:       '#00E676',
          'green-bg':  'rgba(0,230,118,0.10)',
          red:         '#FF3B5C',
          'red-bg':    'rgba(255,59,92,0.10)',
          text:        '#E2E8F0',
          muted:       '#7E8BA0',
          'muted-2':   '#5A6478',
          yellow:      '#FFD166',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        ticker:     'ticker 50s linear infinite',
        'fade-in':  'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        glow:       'glow 3s ease-in-out infinite',
        float:      'float 6s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.15)' },
          '50%':      { boxShadow: '0 0 50px rgba(0,212,255,0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
    }
  },
  plugins: [],
}
