// const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
// BundleAnalyzer는 Bundle 최적화 용도로 보통 저는 사용합니다.

module.exports = {
  experiments: {
    // https://webpack.kr/configuration/experiments/
    asyncWebAssembly: true,
    syncWebAssembly: true, // webpack 4에서와 같이 이전 웹 어셈블리를 지원합니다
    topLevelAwait: true, // 최상위에서 await 사용 시 모듈을 비동기 모듈로 만듭니다.
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
      { // wasm 파일 로드가 안되서 이것 추가해봄.
        test: /\.wasm$/,
        type: "asset/inline",
      },
      { // 이미지 포멧: PNG, JP(E)G, GIF, SVG, WEBP
        // https://yamoo9.gitbook.io/webpack/webpack/webpack-loaders/file-loader
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: './', // 브라우저 시작경로
            name: '[name].[contenthash].[ext]',
          },
        },
      }
    ],
  },
  plugins: [
    // new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    new webpack.ProvidePlugin({
      React: "react",
      process: 'process/browser',
    }),
    // 여기도 wasm 로드때문에 추가해봄.
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/box2d-wasm/dist/es/Box2D.wasm",
          to: './', //브라우저 시작 경로에 wasm 파일 넣어주기!
        },
        {
          from: 'node_modules/box2d-wasm/dist/es/Box2D.simd.wasm',
          to: './', //브라우저 시작 경로에 wasm 파일 넣어주기!
        },
      ],
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