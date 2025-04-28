const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const targetArch = process.env.TARGET_ARCH; // Should be 'x64' or 'arm64'
if (!targetArch) {
  throw new Error("TARGET_ARCH environment variable not set!");
}

const targetPlatform = 'linux';

// --- START: Adjust filename based on arch ---
// Determine the specific suffix used in the .node filename
let nodeArchSuffix = targetArch; // Default to 'x64' or 'arm64'
if (targetArch === 'arm64') {
  nodeArchSuffix = 'arm64v8'; // Use the suffix found in the logs for arm64
}
// Construct the final .node filename
const nodeFileSuffix = `sharp-${targetPlatform}-${nodeArchSuffix}.node`;
// --- END: Adjust filename based on arch ---


const layerBasePath = 'nodejs/node_modules/sharp';
// This path used internally by Sharp's JS code must match the actual .node file
const sharpInternalRequirePath = `../build/Release/${nodeFileSuffix}`;

console.log(`Webpack config: Building for ${targetPlatform}-${targetArch}`);
// This log will now show 'sharp-linux-arm64v8.node' for arm builds
console.log(`Webpack config: Expecting native module: ${nodeFileSuffix}`);
console.log(`Webpack config: Marking require path as external: ${sharpInternalRequirePath}`);

module.exports = {
  name: `layer-${targetArch}`,
  mode: 'production',
  stats: 'minimal',
  target: 'node',
  watch: false,
  entry: {
    [`${layerBasePath}/index`]: './node_modules/sharp/lib/index.js',
  },
  plugins: [
      new CopyPlugin({
        patterns: [
          {
            // This 'from' pattern now uses the correct filename for arm64v8
            from: `node_modules/sharp/build/Release/${nodeFileSuffix}`,
            to: `${layerBasePath}/build/Release/${nodeFileSuffix}`, // Copy to the same relative path
          },
          // Other patterns remain unchanged
          { from: 'node_modules/sharp/LICENSE', to: layerBasePath },
          { from: `node_modules/sharp/vendor`, to: `${layerBasePath}/vendor` },
          { from: `node_modules/sharp/package.json`, to: layerBasePath },
        ],
      }),
      new ZipPlugin({
        // Keep the output ZIP name user-friendly (arm64, not arm64v8)
        filename: `sharp-layer-${targetArch}.zip`,
        pathPrefix: '',
      })
  ],
  optimization: {
    minimize: false,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  externals: {
     // The key here now correctly matches the require path for arm64v8
    [sharpInternalRequirePath]: `commonjs ${sharpInternalRequirePath}`
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  // Keep node-loader removed for now, since x64 worked without it.
  // module: { rules: [ /* node-loader rule */ ] },
};