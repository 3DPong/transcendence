const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  experiments: {
    // https://webpack.kr/configuration/experiments/
    asyncWebAssembly: true,
    syncWebAssembly: true, // webpack 4에서와 같이 이전 웹 어셈블리를 지원합니다
  },
  entry: `${path.resolve(__dirname, "../src")}/index.tsx`,
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: {
            loader: 'babel-loader'
        },
        exclude: /node_modules/,
      },
      { // 이미지 포멧: PNG, JP(E)G, GIF, SVG, WEBP... 기타 등등 필요한 Static 파일들.
        // https://yamoo9.gitbook.io/webpack/webpack/webpack-loaders/file-loader
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: './', // 브라우저 시작경로
            name: '[name].[contenthash].[ext]',
          },
        },
      },
      {
        test: /\.(glb|gltf|obj)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets/'
        },
      },
    ],
  },
  // watch: NODE_ENV === 'prod',
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    new webpack.ProvidePlugin({
      React: "react",
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env' : JSON.stringify(process.env),
    }),
  ],
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      fs: false,
    },
    alias: {
      "@": path.resolve(__dirname, "../src/"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};