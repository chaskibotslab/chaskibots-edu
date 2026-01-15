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
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#252532',
          500: '#32323f',
        },
        neon: {
          cyan: '#00f5ff',
          purple: '#bf00ff',
          pink: '#ff00aa',
          green: '#00ff88',
          orange: '#ff6b00',
          blue: '#0088ff',
        },
        chaski: {
          primary: '#00f5ff',
          secondary: '#bf00ff',
          accent: '#00ff88',
          dark: '#0a0a0f',
          light: '#e0f7ff',
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
        'neon-cyan': '0 0 5px #00f5ff, 0 0 20px #00f5ff40',
        'neon-purple': '0 0 5px #bf00ff, 0 0 20px #bf00ff40',
        'neon-green': '0 0 5px #00ff88, 0 0 20px #00ff8840',
      },
    },
  },
  plugins: [],
}
export default config
