var path = require('path');
const RUN_TIMESTAMP = Math.round(Date.now() / 1000)
//var autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const isProd = (process.env.NODE_ENV === "production");

const plugins = [
  new CleanWebpackPlugin(['dist']),
  new ExtractTextPlugin("[name].[contenthash].css"),
  new webpack.HashedModuleIdsPlugin(),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: (module) => {
      // This prevents stylesheet resources with the .css or .scss extension
      // from being moved from their original chunk to the vendor chunk
      if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
        return false;
      }
      return module.context && module.context.indexOf("node_modules") !== -1;
    },
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity
  })
];

const htmlPageOpts = {
  inject: false,
  title: 'Quelab Signin Page',
  template: require('html-webpack-template'),

  meta: [{
    name: 'viewport',
    content: "width=device-width, initial-scale=1, shrink-to-fit=no"
  }]
}

if (!isProd) {
  htmlPageOpts.devServer = 'http://0.0.0.0:8080'
}

plugins.splice(1, 0, new HtmlWebpackPlugin(htmlPageOpts));

const config = {
  entry: {
    app: './src/master.jsx',
    vendor: ['bootstrap', 'jquery', 'popper.js', 'react-dom', 'react-router-dom', 'showdown']
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: "/static/"
  },

  plugins: plugins,
  module: {
    rules: [
    {
      test: require.resolve('bootstrap'),
      use: "imports-loader?$=jquery,jQuery=jquery,Popper=popper.js"
    },
    {
      test: /\.jsx$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env', 'react']
        }
      }
    },
    {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        //resolve-url-loader may be chained before sass-loader if necessary
        use: [
          {
            loader: 'css-loader',
            options: { modules: false },
          },
          {
            loader: 'sass-loader',
            options: { includePaths: [path.resolve(__dirname, 'node_modules')] },
          }],
      }),
    },
    {
      test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/'
        }
      }]
    }]
  }
};

if (!isProd){
  config.devServer = {
    watchOptions: {
      poll: true
    },
    host: '0.0.0.0',   // localhost doesn't work fo me
    port: 8080,
    proxy: {
      '/static/README.md': {
        target: 'http://0.0.0.0:8888',   //python server is here serving the README
      },
      '/api': {
        target: 'http://0.0.0.0:8888',   //python server is here serving API's
      }
    },
    publicPath: "/static/",
    //necessary for HTML5 "history api" - I guess used by react router...
    historyApiFallback: {
      index: '/static/'
    },
    open: true
  }
  config.devtool = 'inline-source-map';
} else {
  config.devtool = 'cheap-module-source-map';
}



module.exports = config;