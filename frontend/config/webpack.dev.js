const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const apiMocker = require("connect-api-mocker");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",

  devServer: {
    open: false,
    hot: true,
    compress: true,
    port: 8081,
    historyApiFallback: true,
    liveReload: true,

    // Webpack API 목킹
    // https://jeonghwan-kim.github.io/series/2020/01/02/frontend-dev-env-webpack-intermediate.html
    // https://www.npmjs.com/package/connect-api-mocker
  },

  output: {
    filename: "[name].[contenthash].js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/i,
        use: ["style-loader", "css-loader", "postcss-loader"], // 아니 시볼 여기가 문제였네....
      },
    ],
  },
});