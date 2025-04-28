const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

// Read the target architecture from the environment variable set in Dockerfile
const targetArch = process.env.TARGET_ARCH; // Should be 'x64' or 'arm64'
if (!targetArch) {
  throw new Error("TARGET_ARCH environment variable not set!");
}

// Determine the correct platform (should always be linux in this build environment)
const targetPlatform = 'linux'; // We are building in a linux container

// Construct the name of the native Sharp module file
const nodeFileSuffix = `sharp-${targetPlatform}-${targetArch}.node`; // e.g., sharp-linux-x64.node or sharp-linux-arm64.node

// Define the output path structure for Lambda layers
const layerBasePath = 'nodejs/node_modules/sharp';

console.log(`Webpack config: Building for ${targetPlatform}-${targetArch}`);
console.log(`Webpack config: Expecting native module: ${nodeFileSuffix}`);

module.exports = {
  name: `layer-${targetArch}`, // Give the config a name incorporating the arch
  mode: 'production',
  stats: 'minimal',
  target: 'node',
  watch: false,
  entry: {
    // Entry point for Sharp's main lib
    [`${layerBasePath}/index`]: './node_modules/sharp/lib/index.js', // Ensure .js is specified if needed
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          // Copy the compiled native module build ('Release' directory)
          from: `node_modules/sharp/build/Release/${nodeFileSuffix}`,
          to: `${layerBasePath}/build/Release/${nodeFileSuffix}`, // Keep the same structure
        },
        {
          from: 'node_modules/sharp/LICENSE',
          to: layerBasePath,
        },
        {
          // Copy vendor libraries (like libvips) installed for the target arch
          from: `node_modules/sharp/vendor`,
          to: `${layerBasePath}/vendor`,
        },
         {
          // Copy Sharp's package.json - sometimes needed for runtime checks
          from: `node_modules/sharp/package.json`,
          to: layerBasePath,
        },
        // Add any other necessary files from sharp's node_modules directory
      ],
    }),
    new ZipPlugin({
      // Create an architecture-specific filename
      filename: `sharp-layer-${targetArch}.zip`,
      // Specify the base directory for files inside the zip
      // This ensures the 'nodejs/...' structure is at the root of the zip
      pathPrefix: '', // Default might be fine, but explicitly empty can help
    })
  ],
  optimization: {
    minimize: false, // Lambda layers generally shouldn't minimize node_modules internals
  },
  output: {
    filename: '[name].js', // Output filename for the entry point JS
    path: path.resolve(__dirname, 'dist'), // Output directory for webpack build artifacts (including the zip)
    libraryTarget: 'commonjs2',
  },
  externals: {
    // *** CRITICAL: Define the native module as external relative to its expected location ***
    // When sharp requires './build/Release/sharp-linux-x64.node' at runtime,
    // webpack will resolve it to `require('./sharp-linux-x64.node')` within the bundle context.
    // We are providing this file via the CopyPlugin into the correct relative path.
    // --- This section might not be strictly needed if CopyPlugin handles the .node file correctly ---
    // Let's comment it out initially, as CopyPlugin places the file correctly relative to index.js
    // './build/Release/sharp-linux-x64.node': 'commonjs ./build/Release/sharp-linux-x64.node',
    // './build/Release/sharp-linux-arm64.node': 'commonjs ./build/Release/sharp-linux-arm64.node'

    // Update: Simpler approach - let CopyPlugin place the .node file.
    // Sharp's internal require path is usually relative like `require('../build/Release/sharp-....node')`
    // from within `lib/index.js`. Ensure the CopyPlugin maintains this structure.
    // The current CopyPlugin path seems correct for this.
  },
  // Ensure node module resolution works
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
};