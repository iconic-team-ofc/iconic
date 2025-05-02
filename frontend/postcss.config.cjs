// postcss.config.cjs
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),  // <— aqui, NÃO tailwindcss
    require('autoprefixer'),
  ],
};
