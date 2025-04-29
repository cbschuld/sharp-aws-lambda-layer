# Use Amazon Linux 2 base image explicitly
FROM amazonlinux:2

# Install Node.js 20 (to match AWS Lambda runtime)
RUN curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - && \
    yum install -y nodejs && \
    npm install -g npm@latest

WORKDIR /build

# Declare build arguments
ARG TARGET_ARCH
ARG TARGET_PLATFORM=linux

# Install build dependencies for sharp and libvips
RUN yum update -y && \
    yum install -y gcc-c++ make python3 pkgconf tar gzip && \
    # Install libvips and its dependencies
    yum install -y libvips libvips-devel && \
    # Clean up to reduce layer size
    yum clean all && rm -rf /var/cache/yum

# Verify build environment
RUN echo "Building for architecture: ${TARGET_ARCH}" && \
    echo "Target platform: ${TARGET_PLATFORM}"

# Copy package files
COPY package.json package-lock.json webpack.config.js ./

# Install dependencies with architecture-specific flags
RUN npm install --no-optional --no-audit --progress=false \
    --arch=${TARGET_ARCH} --platform=${TARGET_PLATFORM}

# Debug: List sharp directory contents
RUN echo "Listing /build/node_modules/sharp/:" && \
    ls -lR /build/node_modules/sharp/ || echo "Sharp directory listing failed"

# Run Webpack to package the layer
RUN TARGET_ARCH=${TARGET_ARCH} npm run build

# Debug: List dist directory contents
RUN echo "Listing /build/dist/:" && \
    ls -lR /build/dist/

# Smoke test to verify sharp
RUN echo "Running smoke test..." && \
    node -e " \
        const sharp = require('/build/dist/nodejs/node_modules/sharp'); \
        console.log('Sharp loaded successfully'); \
        console.log('Sharp versions:', sharp.versions); \
    " || (echo "Smoke test failed!" && ls -lR /build/dist/nodejs/node_modules/sharp && exit 1)

# No entrypoint needed