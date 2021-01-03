const rules = require('./webpack.rules');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';

const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const assets = ['images', 'rawdata', 'fonts'];

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.scss']
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: assets.map(asset => {
        return {
          from: path.resolve(__dirname, 'src', asset),
          to: path.resolve(__dirname, '.webpack/renderer', asset)
        };
      })
    }),
    new MiniCssExtractPlugin({
      filename: isDevelopment ? '[name].css' : '[name].[hash].css',
      chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
    })
  ]
};
