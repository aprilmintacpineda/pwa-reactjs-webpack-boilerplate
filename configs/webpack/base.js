/** @format */

const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../../.env')
});

const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHTMLWebpackPlugin = require('script-ext-html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const { DefinePlugin } = require('webpack');

const root = process.cwd();

function parseValue (value) {
  if (
    /^[0-9]+(?:\.{1}[0-9]+)?$/gim.test(value) ||
    /^{.*}$/gim.test(value) ||
    /^\[.*\]$/gim.test(value) ||
    value.toLowerCase() === 'true' ||
    value.toLowerCase() === 'false'
  )
    return JSON.parse(value);

  return value;
}

function generateEnvVars (values, prefix) {
  return Object.keys(values).reduce((accumulator, current) => {
    if (/^APP_/.test(current)) {
      let key = current.substr(4);
      if (prefix) key = `process.env.${key}`;
      accumulator[key] = JSON.stringify(parseValue(values[current]));
    }

    return accumulator;
  }, {});
}

module.exports = () => {
  console.log('>> info: generating config for', process.env.NODE_ENV);

  const isProduction = process.env.NODE_ENV === 'production';
  const filenames = isProduction ? '[id]-[hash]' : '[name]';

  const envVars = generateEnvVars(
    {
      ...process.env,
      APP_NODE_ENV: process.env.NODE_ENV
    },
    true
  );
  envVars['process.env'] = JSON.stringify(envVars);

  return {
    stats: 'errors-warnings',
    mode: isProduction ? 'production' : 'development',
    performance: {
      hints: false
    },
    entry: path.join(root, 'src/entry.js'),
    output: {
      path: path.join(root, 'build'),
      filename: `${filenames}.js`,
      chunkFilename: `${filenames}.js`,
      publicPath: '/'
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.js$/,
          use: [
            'babel-loader',
            {
              loader: 'webpack-loader-clean-pragma',
              options: {
                pragmas: [
                  // START https://github.com/aprilmintacpineda/fluxible-js#code-removal
                  {
                    start: '/** @fluxible-config-sync */',
                    end: '/** @end-fluxible-config-sync */'
                  },
                  {
                    start: '/** @fluxible-config-persist */',
                    end: '/** @end-fluxible-config-persist */'
                  },
                  {
                    start: '/** @fluxible-config-use-JSON */',
                    end: '/** @end-fluxible-config-use-JSON */'
                  },
                  {
                    start: '/** @fluxible-config-persist */',
                    end: '/** @end-fluxible-config-persist */'
                  }
                  // END https://github.com/aprilmintacpineda/fluxible-js#code-removal
                ],
                consoles: {
                  logs: isProduction,
                  warns: isProduction,
                  errors: isProduction
                }
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [MiniCSSExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
        },
        {
          test: /\.css$/,
          use: [MiniCSSExtractPlugin.loader, 'css-loader', 'postcss-loader']
        }
      ]
    },
    plugins: [
      new DefinePlugin(envVars),
      new MiniCSSExtractPlugin({
        filename: `${filenames}.css`
      }),
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        // Whether or not Workbox should attempt to identify an delete any precaches created by older, incompatible versions.
        cleanupOutdatedCaches: true,
        directoryIndex: '/',
        manifestTransforms: [
          originalManifest => ({
            manifest: originalManifest.concat([
              {
                url: '/'
              },
              {
                url: '/manifest.json'
              },
              {
                url: '/favicon.ico'
              }
            ])
          })
        ]
      }),
      new HTMLWebpackPlugin({
        minify: true,
        cache: true,
        template: path.join(root, 'public/index.ejs'),
        filename: path.join(root, 'build/index.html'),
        templateParameters: {
          title: process.env.app_title
        }
      }),
      new ScriptExtHTMLWebpackPlugin({
        defaultAttribute: 'defer',
        preload: /\.js$/
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(root, 'public'),
            to: path.join(root, 'build'),
            globOptions: {
              ignore: ['**/index.ejs']
            }
          }
        ]
      })
    ],
    optimization: {
      runtimeChunk: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          react: {
            test: /node_modules\/(react|react-dom|react-router-dom)/,
            name: 'react',
            chunks: 'all',
            reuseExistingChunk: true
          },
          mui: {
            test: /node_modules\/(@material-ui\/core|@material-ui\/icons)/,
            name: 'mui',
            chunks: 'all',
            reuseExistingChunk: true
          }
        }
      },
      minimizer: [
        new TerserWebpackPlugin({
          cache: true,
          parallel: true,
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8
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
              dead_code: true,
              conditionals: true,
              booleans: true
            },
            mangle: {
              safari10: true
            },
            module: false,
            output: {
              ecma: 5,
              comments: false,
              beautify: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true
            }
          }
        }),
        new OptimizeCSSAssetsWebpackPlugin({})
      ]
    },
    resolve: {
      alias: {
        components: path.join(root, 'src/components'),
        routes: path.join(root, 'src/routes'),
        libs: path.join(root, 'src/libs'),
        root: path.join(root, 'src'),
        hooks: path.join(root, 'src/hooks'),
        polyfills: path.join(root, 'src/polyfills'),
        contexts: path.join(root, 'src/contexts')
      }
    }
  };
};
