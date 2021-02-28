module.exports = {
  plugins: {
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
    'postcss-normalize': {},
    autoprefixer: {
      flexbox: 'no-2009',
    },
    cssnano: {
      preset: 'default',
    },
  },
}
