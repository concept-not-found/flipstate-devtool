const Path = require('path')
const Webpack = require('webpack')
const Url = require('url')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',

  entry: [
    'babel-polyfill',
    './src/index.js'
  ],

  output: {
    path: Path.join(__dirname, 'docs'),
    filename: '[name].[chunkhash].js',
    publicPath: `${process.env.PUBLIC_PATH || ''}/`
  },

  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    },
    modules: [
      Path.resolve(__dirname),
      'node_modules'
    ]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new Webpack.DefinePlugin({
      BASE_PATH: JSON.stringify(process.env.PUBLIC_PATH
        ? Url.parse(process.env.PUBLIC_PATH).path
        : '')
    })
  ],

  devtool: 'source-maps',

  devServer: {
    stats: {
      children: false
    },
    overlay: {
      warnings: false,
      errors: true
    },
    historyApiFallback: {
      rewrites: [
        {
          from: /./,
          to: '/index.html'
        }
      ]
    }
  }
}
