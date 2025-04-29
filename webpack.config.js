const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const targetArch = process.env.TARGET_ARCH;
if (!targetArch) {
  throw new Error('TARGET_ARCH environment variable not set!');
}

const layerBasePath = 'nodejs/node_modules/sharp';

console.log(`Building sharp layer for ${targetArch}`);

module.exports = {
  mode: 'production',
  entry: {}, // No entry point needed
  stats: 'minimal',
  target: 'node',
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'node_modules/sharp/',
          to: layerBasePath,
          globOptions: {
            ignore: [
              '**/install/**',
              '**/.bin/**',
              '**/*.{cc,h}',
              '**/binding.gyp',
              '**/docs/**',
              '**/test/**',
              '**/.git*',
              '**/.npmignore',
              '**/src/**'
            ]
          }
        }
      ]
    }),
    new ZipPlugin({
      filename: `sharp-layer-${targetArch}.zip`,
      path: path.resolve(__dirname, 'dist')
    })
  ],
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true
  }
};