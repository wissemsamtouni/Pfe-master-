
const path = require("path");
const webpack = require("webpack");

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js',
  }),

  ],
  resolve:{
    fallback:{os: require.resolve('os-browserify/browser'),
    crypto: require.resolve('crypto-browserify'),
    http: require.resolve('stream-http'),
   url: require.resolve('url/'),
   https: require.resolve('https-browserify'),
    stream: require.resolve('stream-browserify'),
  
    fs: false,
    child_process: false,
   
  },
  // alias: {
  //   'mqtt-packet': path.resolve(__dirname, 'empty-module')
  // },

    
  },
  // externals: [{
  //   buffer: true
  // }],

  mode: 'development',
  entry: "./public/javascripts/script.js",
  output: {
    path: path.resolve(__dirname, "public/javascripts"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};

