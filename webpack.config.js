const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = 'zip-webpack-plugin';

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

// Define the relative path that sharp's JS code uses to require the native module.
// This is typically '../build/Release/...' relative to files in 'lib/'
const sharpInternalRequirePath = `../build/Release/${nodeFileSuffix}`;

console.log(`Webpack config: Building for ${targetPlatform}-${targetArch}`);
console.log(`Webpack config: Expecting native module: ${nodeFileSuffix}`);
console.log(`Webpack config: Marking require path as external: ${sharpInternalRequirePath}`);

module.exports = {
  name: `layer-${targetArch}`, // Give the config a name incorporating the arch
  mode: 'production',
  stats: 'minimal',
  target: 'node', // Important: ensures Webpack uses Node.js style externals/requires
  watch: false,
  entry: {
    // Entry point for Sharp's main lib
    [`${layerBasePath}/index`]: './node_modules/sharp/lib/index.js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          // Copy the compiled native module build ('Release' directory)
          // to the location expected by the runtime require
          from: `node_modules/sharp/build/Release/${nodeFileSuffix}`,
          to: `${layerBasePath}/build/Release/${nodeFileSuffix}`, // Keep the same structure relative to 'lib'
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
      pathPrefix: '',
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
    // *** Tell Webpack NOT to bundle the .node file ***
    // Map the internal require path used by Sharp to a commonjs external type.
    // This leaves the require statement intact for the Node.js runtime.
    [sharpInternalRequirePath]: `commonjs ${sharpInternalRequirePath}`
  },
  // Ensure node module resolution works
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  // Add node-loader as an alternative way to handle .node files if externals doesn't work alone
  // module: {
  //   rules: [
  //     {
  //       test: /\.node$/,
  //       loader: 'node-loader',
  //       options: {
  //         name: '[path][name].[ext]', // Keep original path/name
  //       },
  //     },
  //   ],
  // },
};