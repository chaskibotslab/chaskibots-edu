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
          950: '#0a0a0f',
          900: '#12121a',
          800: '#1a1a24',
          700: '#252532',
          600: '#32324a',
          500: '#4a4a6a',
        },
        neon: {
          cyan: '#00d4ff',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
          orange: '#f59e0b',
          blue: '#3b82f6',
        },
        chaski: {
          primary: '#8b5cf6',
          secondary: '#06b6d4',
          accent: '#10b981',
          dark: '#0a0a0f',
          light: '#e2e8f0',
          gold: '#fbbf24',
        },
        brand: {
          purple: '#8b5cf6',
          violet: '#7c3aed',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          teal: '#14b8a6',
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
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
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
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #58a6ff40, 0 0 30px #58a6ff20',
        'neon-purple': '0 0 10px #a371f740, 0 0 30px #a371f720',
        'neon-green': '0 0 10px #3fb95040, 0 0 30px #3fb95020',
        'glow': '0 4px 20px rgba(88, 166, 255, 0.15)',
        'glow-lg': '0 8px 40px rgba(88, 166, 255, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config
