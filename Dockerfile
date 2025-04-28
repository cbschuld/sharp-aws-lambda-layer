# Use a multi-arch base image
FROM public.ecr.aws/sam/build-nodejs20.x:latest

WORKDIR /build

# Declare build argument for target architecture
ARG TARGET_ARCH

# Verify the build environment architecture (optional debug step)
RUN echo "Building on architecture: $(uname -m)"
RUN echo "TARGET_ARCH argument: ${TARGET_ARCH}"

# Copy necessary files
COPY package.json package-lock.json webpack.config.js ./
# Copy other potential source files if needed by webpack or sharp install
# COPY src ./src

# Install dependencies - npm install inside the target arch container
# Sharp's install script will use process.arch (e.g., 'x64', 'arm64')
# derived from the container's architecture to fetch correct binaries.
RUN npm --no-optional --no-audit --progress=false --arch=${TARGET_ARCH} --platform=linux install

# Run webpack, passing the TARGET_ARCH environment variable
# Webpack config will use this to create arch-specific output
RUN TARGET_ARCH=${TARGET_ARCH} node ./node_modules/webpack/bin/webpack.js

# Simple test to ensure sharp loads correctly for the target architecture
RUN node -e "console.log(require('sharp')('./package.json'))"

# No entrypoint needed - we will copy the file out using 'docker run -v' or 'docker cp'
# The final ZIP file is now expected to be in /build/dist/sharp-layer-${TARGET_ARCH}.zip
# based on the updated webpack config.