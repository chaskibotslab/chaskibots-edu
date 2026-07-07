import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0f172a',
          900: '#1e293b',
          800: '#334155',
          700: '#475569',
          600: '#64748b',
          500: '#94a3b8',
        },
        light: {
          50: '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#ECECEA',
          400: '#E0E0E0',
          500: '#D4D4D4',
        },
        neon: {
          cyan: '#30B0C7',
          purple: '#007AFF',
          pink: '#ec4899',
          green: '#10b981',
          orange: '#f97316',
          blue: '#0A84FF',
        },
        chaski: {
          primary: '#007AFF',
          secondary: '#339DFF',
          accent: '#0051D5',
          dark: '#0f172a',
          light: '#f2f8ff',
          gold: '#f59e0b',
        },
        brand: {
          purple: '#007AFF',
          violet: '#0051D5',
          indigo: '#5E5CE6',
          cyan: '#30B0C7',
          teal: '#0d9488',
          orange: '#f97316',
          light: '#f2f8ff',
        },
        level: {
          inicial: '#ff6b9d',
          preparatoria: '#ffa726',
          elemental: '#66bb6a',
          media: '#42a5f5',
          superior: '#ab47bc',
          bachillerato: '#ef5350',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(48,176,199,0.4), 0 0 30px rgba(48,176,199,0.2)',
        'neon-purple': '0 0 10px rgba(0,122,255,0.4), 0 0 30px rgba(0,122,255,0.2)',
        'neon-green': '0 0 10px rgba(16,185,129,0.4), 0 0 30px rgba(16,185,129,0.2)',
        'brand-purple': '0 4px 20px rgba(0,122,255,0.25)',
        'glow': '0 4px 20px rgba(0,122,255,0.15)',
        'glow-lg': '0 8px 40px rgba(0,122,255,0.2)',
      },
    },
  },
  plugins: [],
}
export default config
