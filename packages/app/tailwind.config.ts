import { Config } from 'tailwindcss'

export default <Config>{
  darkMode: 'media',
  content: [
    './assets/**/*.{vue,js,css}',
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        background: 'var(--background-color)',
        'background-secondary': 'var(--background-color-secondary)',
      },
      spacing: {
        112: '28rem',
        160: '40rem',
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
}
