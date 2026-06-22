import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      colors: {
        indigo: {
          550: '#6366f1',
          650: '#4f46e5',
        },
        slate: {
          250: '#f1f5f9',
          450: '#94a3b8',
          550: '#64748b',
          650: '#475569',
          750: '#1e293b',
        },
        orange: {
          550: '#ea580c',
          650: '#dc2626',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
