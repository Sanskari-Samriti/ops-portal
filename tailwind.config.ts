import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#FF6B35', dark: '#CC4A0A', light: '#FFE8D6' },
      },
    },
  },
  plugins: [],
}
export default config
