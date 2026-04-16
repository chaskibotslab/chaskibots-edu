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
          950: '#1a1a1a',
          900: '#2d2d2d',
          800: '#404040',
          700: '#525252',
          600: '#6b6b6b',
          500: '#858585',
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
          cyan: '#74AFAD',
          purple: '#558C89',
          pink: '#D9853B',
          green: '#558C89',
          orange: '#D9853B',
          blue: '#74AFAD',
        },
        chaski: {
          primary: '#558C89',
          secondary: '#74AFAD',
          accent: '#D9853B',
          dark: '#0a0a0f',
          light: '#ECECEA',
          gold: '#D9853B',
        },
        brand: {
          purple: '#558C89',
          violet: '#4a7a77',
          indigo: '#74AFAD',
          cyan: '#74AFAD',
          teal: '#558C89',
          orange: '#D9853B',
          light: '#ECECEA',
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
