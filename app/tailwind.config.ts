import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'zzik-coral': '#FF5A5F',
        'deep-space': '#0A1628',
        'electric-cyan': '#00D9FF',
      },
      /* P0-5: Consolidated font family (single source of truth) */
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'ui-monospace',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}

export default config
