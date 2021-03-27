const path = require('path')
const fs = require('fs')

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
]

const resolveApp = (relativePath) => path.resolve(appDir, relativePath)
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) => fs.existsSync(resolveFn(`${filePath}.${extension}`)))
  if (extension) {
    return resolveFn(`${filePath}.${extension}`)
  }
  return resolveFn(`${filePath}.js`)
}

const appDir = fs.realpathSync(process.cwd())
const srcDir = path.resolve(__dirname, './src')
const buildDir = path.resolve(__dirname, './dist')
const publicDir = path.resolve(__dirname, './public')

// html template -> js file (chunk)
// const pages = { index: 'index', about: 'index' }
const pages = { index: 'index', about: 'about' }

const files = Object.keys(pages).reduce(
  (prev, page) => ({
    ...prev,
    [page]: {
      js: resolveModule(resolveApp, `src/${pages[page]}`),
      template: resolveApp(`templates/${page}.html`),
      html: `${page}.html`,
      chunk: pages[page],
    },
  }),
  {}
)

module.exports = {
  srcDir,
  buildDir,
  publicDir,
  files,
  moduleFileExtensions,
  appNodeModules: resolveApp('node_modules'),
  appTsConfig: resolveApp('tsconfig.json'),
}
