var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval-source-map',
  entry: ['./src/index.js'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    noParse: /\.ne$/,
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: [path.join(__dirname, 'src')]
    }, {
      test: /\.css$/,
      loaders: ["style-loader", "css-loader", "less-loader"]
    }, {
      test: /\.(ne|tsv|csv|txt)$/,
      loaders: ["raw-loader"]
    }]
  },
  node: {
    fs: "empty"
  }
};