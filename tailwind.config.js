/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{astro,js,jsx,ts,tsx,mdx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        dark: {
          css: {
            color: theme('colors.gray.100'),
            '[class~="lead"]': { color: theme('colors.gray.300') },
            a: { color: theme('colors.lime.400') },
            strong: { color: theme('colors.yellow.400') },
            'ol > li::before': { color: theme('colors.gray.400') },
            'ul > li::before': { color: theme('colors.gray.600') },
            hr: { borderColor: theme('colors.gray.700') },
            blockquote: {
              color: theme('colors.gray.100'),
              borderLeftColor: theme('colors.lime.400'),
            },
            h1: { color: theme('colors.lime.400') },
            h2: { color: theme('colors.yellow.400') },
            h3: { color: theme('colors.sky.400') },
            h4: { color: theme('colors.gray.100') },
            code: { color: theme('colors.lime.400') },
            'a code': { color: theme('colors.lime.400') },
            pre: {
              color: theme('colors.gray.100'),
              backgroundColor: theme('colors.gray.800'),
            },
            thead: {
              color: theme('colors.gray.100'),
              borderBottomColor: theme('colors.gray.700'),
            },
            tbody: {
              tr: { borderBottomColor: theme('colors.gray.800') },
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
} 