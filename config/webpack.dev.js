/** @format */

const path = require('path');

module.exports = {
  ...require('./webpack.base')(),
  mode: 'development',
  watch: true,
  devtool: 'source-map',
  watchOptions: {
    aggregateTimeout: 0
  },
  devServer: {
    watchContentBase: true,
    contentBase: path.join(__dirname, '../build'),
    contentBasePublicPath: '/',
    compress: true,
    host: '0.0.0.0',
    port: 3000,
    open: true
  }
};
