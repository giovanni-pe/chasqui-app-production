// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tonos base y acentos como gradientes
        primaryStart: 'var(--tw-gradient-from)',   // usa from-blue-500
        primaryEnd:   'var(--tw-gradient-to)',     // usa to-cyan-500
        accentStart:  'var(--tw-gradient-from)',   // from-violet-500
        accentEnd:    'var(--tw-gradient-to)',     // to-purple-500
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        float:   'float 3s ease-in-out infinite',
      },
      boxShadow: {
        soft:  '0 4px 20px -4px rgba(59,130,246,0.2)',
        mid:   '0 12px 40px -12px rgba(59,130,246,0.3)',
        glam:  '0 20px 60px -12px rgba(0,0,0,0.1), 0 8px 30px -8px rgba(59,130,246,0.2)',
      },
      backdropBlur: {
        xs: '2xl',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

// ---
