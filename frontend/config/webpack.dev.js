const { merge } = require("webpack-merge");
const common = require("./webpack.common");
// const path = require("path");
// const isLocal = process.env.NODE_ENV === 'local';

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",

  // https://webpack.kr/configuration/dev-server/#devserverallowedhosts
  devServer: {
    open: false,
    hot: true,
    compress: true,
    port: 8081,
    historyApiFallback: true,
    liveReload: true,
    allowedHosts: ['all'],
    //자꾸 webpack socket error뜨는거 짜증나서 추가
    client: {
      overlay: true,
      webSocketURL: "ws://0.0.0.0:80/ws",
    },
    // static: ['assets'],
  },

  output: {
    filename: "client-bundle.[name].js",
    publicPath: "/",
  },

  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/i,
        use: ["style-loader", "css-loader", "postcss-loader"], // 아니 시볼 여기가 문제였네....
      },
      // { // 3D Objects
      //   test: /\.(obj|glb)$/,
      //   include: path.resolve(__dirname, "src"),
      //   type: "asset/resource",
      //   generator: {
      //     filename: "assets/[name][ext]",
      //   },
      // },
    ],
  },
});