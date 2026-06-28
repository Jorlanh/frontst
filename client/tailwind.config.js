/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Adicione os caminhos corretos do seu projeto acima, caso sejam diferentes
  ],
  theme: {
    extend: {
      // É AQUI DENTRO DO EXTEND QUE O CÓDIGO DEVE FICAR
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        }
      },
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) infinite',
      }
    },
  },
  plugins: [],
}