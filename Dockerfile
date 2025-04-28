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

# Run webpack, passing the TARGET_ARCH environment variable
# Webpack config will use this to create arch-specific output
RUN TARGET_ARCH=${TARGET_ARCH} node ./node_modules/webpack/bin/webpack.js

# --- Smoke Test ---
RUN echo ">>> Running smoke test on packaged layer..." && \
node -e " \
  try { \
    /* --- HARDCODE Correct path relative to /build/dist --- */ \
    const sharp = require('/build/dist/nodejs/node_modules/sharp'); \
    console.log('>>> SUCCESS: require(\'sharp\') loaded.'); \
    /* Check for versions property existence before accessing */ \
    if (sharp && sharp.versions) { \
        console.log('Sharp versions:', sharp.versions); \
    } else { \
        console.log('Sharp loaded, but versions property not found.'); \
    } \
  } catch (err) { \
    console.error('>>> FAILURE: require(\'sharp\') failed:', err); \
    /* Add more debug info on failure */ \
    console.error('Listing /build/dist/nodejs/node_modules/sharp contents on failure:'); \
    ls -lR /build/dist/nodejs/node_modules/sharp || echo 'Failed to list contents.'; \
    exit 1; \
  } \
"
# --- End Smoke Test ---

# Simple test to ensure sharp loads correctly for the target architecture
# Note: This might fail now if webpack failed, run it only after successful webpack
# RUN node -e "console.log(require('sharp')('./package.json'))"

# No entrypoint needed