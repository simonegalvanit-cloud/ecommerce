import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: { outfit: ['Outfit', 'sans-serif'] },
      colors: {
        accent:  { DEFAULT: '#e8721a', 2: '#f08a3a', 3: '#f5a05a', bg: '#fff4ec' },
        ink:     { DEFAULT: '#1a1a1a', 2: '#2e2e2e', 3: '#5c5c5c', 4: '#9e9e9e' },
        surface: { DEFAULT: '#faf8f6', 2: '#f4f1ed', 3: '#ece7e0' },
        green:   { dark: '#1e4230', mid: '#2d5a3d', light: '#e6f0e9', solid: '#1e7e34', bg: '#e6f4ea' },
        blue:    { solid: '#1565c0', bg: '#e3f2fd' },
        yellow:  { solid: '#f57f17', bg: '#fff8e1' },
        red:     { solid: '#d93025', bg: '#fdecea' },
      },
      borderRadius: { r: '6px', lg: '12px', xl: '20px' },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.07), 0 8px 24px rgba(0,0,0,0.05)',
        lg:   '0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}

export default config
