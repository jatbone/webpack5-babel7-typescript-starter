const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const resolve = require('resolve')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const paths = require('./paths')

const isDev = process.env.NODE_ENV !== 'production'
const publicPath = '/'
const cssRegex = /\.css$/
const sassRegex = /\.(scss|sass)$/
const useTypeScript = fs.existsSync(paths.appTsConfig)
const browser = 'Google Chrome Dev'

const getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    isDev && 'style-loader',
    !isDev && {
      loader: MiniCssExtractPlugin.loader,
    },
    {
      loader: 'css-loader',
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: 'postcss-loader',
      options: {
        sourceMap: !isDev,
      },
    },
  ].filter(Boolean)
  if (preProcessor) {
    loaders.push({
      loader: preProcessor,
      options: {
        sourceMap: !isDev,
      },
    })
  }
  return loaders
}

const config = {
  bail: !isDev,
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
  entry: paths.jsFile,
  output: {
    // The build folder.
    path: !isDev ? paths.buildDir : undefined,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: isDev,
    // There will be one main bundle, and one file per asynchronous chunk.
    // In development, it does not produce real files.
    filename: isDev ? 'static/js/[name].bundle.js' : 'static/js/[name].[contenthash:8].js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: isDev ? 'static/js/[name].[chunkhash].js' : 'static/js/[name].[contenthash:8].chunk.js',
    // We inferred the "public path" (such as / or /my-project) from homepage.
    // We use "/" in development.
    publicPath: publicPath,
  },

  // Spin up a server for quick development
  devServer: isDev
    ? {
        historyApiFallback: true,
        contentBase: paths.publicDir,
        open: browser,
        compress: true,
        hot: true,
        port: 8080,
      }
    : undefined,

  optimization: {
    minimize: !isDev,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
      }),
    ],
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },

  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebook/create-react-app/issues/253
    modules: ['node_modules'],
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebook/create-react-app/issues/290
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
    fallback: {
      module: false,
    },
  },

  module: {
    rules: [
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'static/images/[name].[hash:8].[ext]',
              esModule: false,
            },
          },
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: paths.srcDir,
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              cacheDirectory: true,
            },
          },
          // Process any JS outside of the app with Babel.
          // Unlike the application JS, we only compile the standard ES features.
          {
            test: /\.(js|mjs)$/,
            exclude: /@babel(?:\/|\\{1,2})runtime/,
            loader: 'babel-loader',
            options: {
              babelrc: false,
              configFile: false,
              compact: false,
              presets: ['@babel/preset-env'],
              cacheDirectory: true,
              sourceMaps: false,
            },
          },
          {
            test: cssRegex,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: false,
            }),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
          },
          {
            test: sassRegex,
            use: getStyleLoaders(
              {
                importLoaders: 2,
                sourceMap: false,
              },
              'sass-loader'
            ),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
          },
        ],
      },
    ],
  },

  plugins: [
    !isDev && new CleanWebpackPlugin(),
    ...paths.htmlFile.map(
      (obj) =>
        new HtmlWebpackPlugin(
          Object.assign(
            {},
            {
              inject: true,
              template: obj.template,
              filename: obj.filename,
              chunks: [obj.chunk],
            },
            !isDev
              ? {
                  minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                  },
                }
              : undefined
          )
        )
    ),
    !isDev &&
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
    isDev && new webpack.HotModuleReplacementPlugin(),
    // TypeScript type checking
    useTypeScript &&
      new ForkTsCheckerWebpackPlugin({
        async: isDev,
        typescript: {
          configFile: paths.appTsConfig,
          typescriptPath: resolve.sync('typescript', {
            basedir: paths.appNodeModules,
          }),
        },
      }),
    isDev && new CaseSensitivePathsPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ].filter(Boolean),
}

module.exports = config
