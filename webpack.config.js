const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

// targetArch is still passed but might not be directly used in this simplified config
const targetArch = process.env.TARGET_ARCH;
if (!targetArch) {
  throw new Error("TARGET_ARCH environment variable not set!");
}

// Define the standard Lambda layer path
const layerBasePath = 'nodejs/node_modules/sharp';

console.log(`Webpack config: Building N-API layer for ${targetArch}`);

module.exports = {
  name: `layer-${targetArch}`,
  mode: 'production',
  // Prevent bundling - we only want to copy files for N-API
  // We can achieve this by setting a non-existent entry or using only plugins
  entry: {}, // No actual entry point needed, CopyPlugin does the work
  stats: 'minimal',
  target: 'node',
  watch: false,
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          // Copy the *entire* installed sharp package content
          from: 'node_modules/sharp/',
          to: `${layerBasePath}/`, // Target: nodejs/node_modules/sharp/
          // Exclude files definitely not needed at runtime to save space
          globOptions: {
            ignore: [
              '**/install/**', // Install scripts
              '**/.bin/**', // Bin scripts (if any)
              '**/*.{cc,h}', // C++ source/headers
              '**/binding.gyp', // Build files
              '**/docs/**', // Documentation
              '**/test/**', // Test files
              '**/.gitattributes',
              '**/.github/**',
              '**/.npmignore',
              // Add any other known non-runtime files/dirs
            ],
          },
        },
      ],
    }),
    new ZipPlugin({
      filename: `sharp-layer-${targetArch}.zip`,
      pathPrefix: '', // Ensure files are zipped from the 'dist' root correctly
    })
  ],
  optimization: {
    minimize: false, // Don't minimize node_modules
  },
  output: {
    // Output path is still needed for plugins
    path: path.resolve(__dirname, 'dist'),
    // Clean the output directory before build
    clean: true,
  },
  // No externals needed for N-API (Node should resolve require('sharp') correctly)
  // No module rules for .node needed
};