// This file is used by react-scripts to customize webpack configuration
// It will be automatically picked up by react-scripts

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // Add plugins to ensure CSS files have the correct MIME type
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
  ],
  
  // Configure module rules for CSS
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      }
    ]
  },
  // Add your webpack configuration here
  optimization: {
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 10000, // Reduced from 20000 to create more granular chunks
      maxSize: 250000, // Limit chunk size to prevent large bundles
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name of the npm package
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            
            // Group smaller packages together to avoid too many small chunks
            if (['react-icons', 'lodash', 'axios'].includes(packageName)) {
              return 'npm.common-utils';
            }
            
            // Return a chunk name based on npm package name
            return `npm.${packageName.replace('@', '')}`;
          },
          priority: 10,
        },
        // Separate React into its own chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'npm.react-core',
          priority: 20,
        },
        // UI components
        ui: {
          test: /[\\/]src[\\/]Components[\\/]/,
          name: 'ui-components',
          priority: 15,
          minChunks: 2,
        },
        // Common utilities
        utils: {
          test: /[\\/]src[\\/](utils|hooks|services)[\\/]/,
          name: 'app-utils',
          priority: 15,
          minChunks: 2,
        },
        // Styles
        styles: {
          test: /\.css$/,
          name: 'styles',
          priority: 5,
          minChunks: 2,
        },
        // Default vendor chunk
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        // Default chunk for everything else
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 250000, // 250 KB
    maxEntrypointSize: 500000, // 500 KB
  },
};