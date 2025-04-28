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

# Install dependencies
RUN npm --no-optional --no-audit --progress=false --arch=${TARGET_ARCH} --platform=${TARGET_PLATFORM} install

# --- START TEMPORARY DEBUG STEP ---
# List the contents of the sharp directory AFTER install to see the structure
RUN echo ">>> Listing contents of /build/node_modules/sharp/ after install <<<" && \
    ls -lR /build/node_modules/sharp/ || echo "Sharp directory not found?"
# --- END TEMPORARY DEBUG STEP ---

# Run webpack, passing the TARGET_ARCH environment variable
# Webpack config will use this to create arch-specific output
RUN TARGET_ARCH=${TARGET_ARCH} node ./node_modules/webpack/bin/webpack.js

# Simple test to ensure sharp loads correctly for the target architecture
# Note: This might fail now if webpack failed, run it only after successful webpack
# RUN node -e "console.log(require('sharp')('./package.json'))"

# No entrypoint needed