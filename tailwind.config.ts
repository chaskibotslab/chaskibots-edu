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
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d',
          500: '#484f58',
        },
        neon: {
          cyan: '#58a6ff',
          purple: '#a371f7',
          pink: '#f778ba',
          green: '#3fb950',
          orange: '#f0883e',
          blue: '#388bfd',
        },
        chaski: {
          primary: '#58a6ff',
          secondary: '#a371f7',
          accent: '#3fb950',
          dark: '#0d1117',
          light: '#c9d1d9',
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
