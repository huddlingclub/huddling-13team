import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './components/**/*.{ts,tsx}',
    './App.tsx',
    './main.tsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        // 점심메뉴 낚시의 픽셀 라벨(CAST!, PULL! 등)
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        // 점심메뉴 낚시 프로토타입(menu-fishing.html)의 색
        fish: {
          navy: '#26305C',
          ink: '#1E2433',
          sub: '#5B6684',
          orange: '#F29A3A',
          sky: '#E3EEF8',
          line: '#D5DEEA',
          beige: '#F4EDE1',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)', 
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config


