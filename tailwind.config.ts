import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          550: '#6366f1',
          650: '#4f46e5',
          750: '#3730a3',
        },
        slate: {
          205: '#f1f5f9',
          250: '#f1f5f9',
          350: '#cbd5e1',
          450: '#94a3b8',
          550: '#64748b',
          650: '#475569',
          750: '#1e293b',
          805: '#0f172a',
        },
        orange: {
          550: '#ea580c',
          650: '#dc2626',
          850: '#7c2d12',
        },
        amber: {
          650: '#d97706',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'streak-pop': 'streakPop 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        streakPop: {
          '0%': { opacity: '1', transform: 'scale(0.5)' },
          '100%': { opacity: '0', transform: 'scale(1.5)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
