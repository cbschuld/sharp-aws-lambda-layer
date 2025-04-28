# Use a multi-arch base image
FROM public.ecr.aws/sam/build-nodejs20.x:latest

WORKDIR /build

# Declare build argument for target architecture
ARG TARGET_ARCH
ARG TARGET_PLATFORM=linux # Default platform

# Verify the build environment architecture (optional debug step)
RUN echo "Building on architecture: $(uname -m)"
RUN echo "TARGET_ARCH argument: ${TARGET_ARCH}"
RUN echo "TARGET_PLATFORM argument: ${TARGET_PLATFORM}"

# Copy necessary files
COPY package.json package-lock.json webpack.config.js ./
# Copy other potential source files if needed by webpack or sharp install
# COPY src ./src

# Install dependencies - npm install inside the target arch container
# Sharp's install script will use process.arch (e.g., 'x64', 'arm64')
# derived from the container's architecture to fetch correct binaries.
RUN npm --no-optional --no-audit --progress=false --arch=${TARGET_ARCH} --platform=${TARGET_PLATFORM} install

# --- START TEMPORARY DEBUG STEP ---
# Combine the whole check into a single shell command executed by RUN
RUN set -e && \
    echo ">>> Checking for .node file presence for ${TARGET_PLATFORM}-${TARGET_ARCH}..." && \
    NODE_FILE_PATH="/build/node_modules/sharp/build/Release/sharp-${TARGET_PLATFORM}-${TARGET_ARCH}.node" && \
    if [ -f "$NODE_FILE_PATH" ]; then \
      echo ">>> SUCCESS: Found file:" && \
      ls -l "$NODE_FILE_PATH"; \
    else \
      echo ">>> FAILURE: File NOT found at $NODE_FILE_PATH!" && \
      echo ">>> Listing /build/node_modules/sharp/build/Release contents:" && \
      ls -l /build/node_modules/sharp/build/Release/ && \
      echo ">>> Listing /build/node_modules/sharp/vendor contents (if exists):" && \
      ls -lR /build/node_modules/sharp/vendor/ || echo "(Vendor dir listing failed or not found)" && \
      exit 1; \
    fi
# --- END TEMPORARY DEBUG STEP ---


# Run webpack, passing the TARGET_ARCH environment variable
# Webpack config will use this to create arch-specific output
RUN TARGET_ARCH=${TARGET_ARCH} node ./node_modules/webpack/bin/webpack.js

# Simple test to ensure sharp loads correctly for the target architecture
# Note: This might fail now if webpack failed, run it only after successful webpack
# RUN node -e "console.log(require('sharp')('./package.json'))"

# No entrypoint needed