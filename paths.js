const path = require('path')
const fs = require('fs')

const appDir = fs.realpathSync(process.cwd())
const srcDir = path.resolve(__dirname, './src')
const buildDir = path.resolve(__dirname, './dist')
const publicDir = path.resolve(__dirname, './public')

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

const pages = { index: 'index', about: 'index' }

const jsFile = Object.keys(pages).reduce(
  (prev, page) => ({
    ...prev,
    [page]: resolveModule(resolveApp, `src/${pages[page]}`),
  }),
  {}
)

const htmlFile = Object.keys(pages).map((page) => ({
  template: resolveApp(`templates/${page}.html`),
  filename: `${page}.html`,
  chunk: pages[page],
}))

module.exports = {
  srcDir,
  buildDir,
  publicDir,
  htmlFile,
  jsFile,
  moduleFileExtensions,
  appNodeModules: resolveApp('node_modules'),
  appTsConfig: resolveApp('tsconfig.json'),
}
