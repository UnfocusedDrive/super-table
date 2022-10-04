/**
 * Webpack Library Config (Library App)
 * The config file is for other packages to consume this one.
 */
const commonConfig = require('./webpack.common.config');
const { merge } = require('webpack-merge');
const path = require('path');

module.exports = merge(commonConfig, {
  devServer: {
    contentBase: './dist',
  },
  entry: './src/export.js',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    library: {
      name:'warp-gate',
      type: 'umd'
    }
  }
});
