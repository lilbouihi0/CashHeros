const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// Import our custom webpack plugin
const HelmetPatchPlugin = require('./webpack.plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Add our custom plugin to patch react-helmet-async
      webpackConfig.plugins.push(new HelmetPatchPlugin());
      
      // Only run optimizations in production
      if (env === 'production') {
        // Generate bundle stats for analysis
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'disabled',
            generateStatsFile: true,
            statsFilename: path.join(paths.appBuild, 'bundle-stats.json'),
          })
        );
        
        // Enable gzip compression
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240, // Only compress files > 10kb
            minRatio: 0.8,
          })
        );
        
        // Optimize CSS extraction
        webpackConfig.plugins.push(
          new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
          })
        );
        
        // Optimize images
        webpackConfig.optimization.minimizer.push(
          new ImageMinimizerPlugin({
            minimizer: {
              implementation: ImageMinimizerPlugin.imageminMinify,
              options: {
                plugins: [
                  ['gifsicle', { interlaced: true }],
                  ['jpegtran', { progressive: true }],
                  ['optipng', { optimizationLevel: 5 }],
                  ['svgo', { plugins: [{ name: 'preset-default' }] }],
                ],
              },
            },
          })
        );
        
        // Optimize CSS
        webpackConfig.optimization.minimizer.push(new CssMinimizerPlugin());
        
        // Configure Terser for better JS minification
        webpackConfig.optimization.minimizer.push(
          new TerserPlugin({
            terserOptions: {
              parse: {
                ecma: 8,
              },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
                drop_console: true,
              },
              mangle: {
                safari10: true,
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
            parallel: true,
          })
        );
        
        // Split chunks more aggressively
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Get the name of the npm package
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1];
                
                // Return a chunk name based on npm package name
                return `npm.${packageName.replace('@', '')}`;
              },
            },
            // Separate React into its own chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'npm.react',
              priority: 20,
            },
            // Group common utilities
            utils: {
              test: /[\\/]src[\\/]utils[\\/]/,
              name: 'utils',
              priority: 10,
            },
          },
        };
      }
      
      return webpackConfig;
    },
  },
  // Add Jest configuration
  jest: {
    configure: {
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  },
  // Add Babel configuration
  babel: {
    presets: [],
    plugins: [
      // Add our custom babel plugin to transform react-helmet-async
      require.resolve('./src/utils/babelHelmetPlugin')
    ],
    loaderOptions: (babelLoaderOptions) => {
      return babelLoaderOptions;
    },
  },
  // Add PostCSS configuration
  style: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-flexbugs-fixes'),
        require('postcss-preset-env')({
          autoprefixer: {
            flexbox: 'no-2009',
          },
          stage: 3,
        }),
      ],
    },
    css: {
      loaderOptions: {
        // Ensure CSS files have the correct MIME type
        sourceMap: true,
        modules: {
          auto: true,
        },
      },
    },
  },
  // Add dev server configuration to ensure correct MIME types
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      // Ensure CSS files have the correct MIME type
      '.css': {
        'Content-Type': 'text/css',
      },
    },
  },
};