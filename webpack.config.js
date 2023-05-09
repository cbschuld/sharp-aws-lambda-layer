const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const distPath = 'nodejs/node_modules/sharp';

module.exports = {
  name: 'layer',
  mode: 'production',
  stats: 'minimal',
  target: 'node',
  watch: false,
  entry: {
    [`${distPath}/index`]: './node_modules/sharp/lib/index',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'node_modules/sharp/build',
          to: `${distPath}/build`,
        },
        {
          from: 'node_modules/sharp/LICENSE',
          to: distPath,
        },
        {
          from: `node_modules/sharp/vendor`,
          to: `${distPath}/vendor`,
        },
      ],
    }),
    new ZipPlugin({
      filename: 'sharp-layer.zip',
    })
  ],
  optimization: {
    // minimize will be enabled in Github Actions
    minimize: process.env.NODE_ENV === 'production',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  externals: {
    './sharp-linux-x64.node': './build/Release/sharp-linux-x64.node',
  },
};
