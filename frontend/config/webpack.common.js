// const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
// BundleAnalyzer는 Bundle 최적화 용도로 보통 저는 사용합니다.

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
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    new webpack.ProvidePlugin({
      React: "react",
      process: 'process/browser',
    }),
    // new CopyWebpackPlugin({
      // patterns: [{ from: 'src/assets', to: 'assets' }] // 브라우저 디렉토리에 파일을 복붙해줌.
    // }),
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