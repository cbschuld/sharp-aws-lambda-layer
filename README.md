# AWS Sharp Lambda Layer (x64 & arm64)

This AWS lambda layer contains a pre-built [sharp](https://www.npmjs.com/package/sharp) **v0.34 (Napi)** npm library, optimized for frugal space usage.

It provides builds for both **`x86_64` (x64)** and **`arm64` (Graviton)** architectures.

Includes support for Node.js 18, Node.js 20 and Node.js 22 runtimes.

## Dependencies (for Building Locally Only)

- Docker with Buildx enabled (usually default in recent versions)

## AWS Server - Installs (Context Only)

If setting up a build environment on EC2, you might need:
```sh
sudo yum install docker git wget curl
sudo systemctl start docker
```

## AWS Repository Description

This serverless application provides an AWS Lambda Layer that includes the sharp image processing library (v0.34 Napi) for Node.js. It supports both `x86_64` and `arm64` architectures and Node.js 18.x, 20.x, and 22.x runtimes.

The original work is from Paul Spencer; this is a fork updated for newer Node/Sharp versions and multi-architecture support via GitHub Actions.

## AWS Repository License

http://www.apache.org/licenses/LICENSE-2.0

## Getting Pre-Built Layers

The easiest way to use this layer is to download the pre-built ZIP files directly from the [invalid URL removed].

Each release contains two ZIP files:

+ `sharp-layer-x64.zip`: For Lambda functions using the x86_64 architecture.
+ `sharp-layer-arm64.zip`: For Lambda functions using the arm64 architecture.

Download the ZIP file corresponding to the architecture of your Lambda function. You can then upload it directly via the AWS Console or use the AWS CLI (see Publishing section below).

## Building the Layers (Optional)
The GitHub Actions workflow in this repository automatically builds, tests, and releases the layer ZIP files for both architectures. Using the pre-built releases is recommended.

If you need to build the layers locally:

## Steps

1. Clone the repo:
   ```shell script
   git clone git@github.com:cbschuld/sharp-aws-lambda-layer.git
   cd sharp-aws-lambda-layer/
   ```
2. Ensure Docker Buildx is set up. (Usually available by default in current Docker versions).
   ```shell script
   docker run -v "$PWD":/var/task public.ecr.aws/sam/build-nodejs22.x:latest npm --no-optional --no-audit --progress=false install
   ```
3. Build using docker buildx (examples):
   + Build for x64:
      ```shell script
         # Build the image targeting linux/amd64
         docker buildx build --platform linux/amd64 --build-arg TARGET_ARCH=x64 -t sharp-layer-builder-x64 --load .

         # Create output directory
         mkdir -p dist/x64

         # Copy the generated zip file from the container
         docker run --rm -v "$(pwd)/dist/x64":/output sharp-layer-builder-x64 \
      cp /build/dist/sharp-layer-x64.zip /output/
      ```
   + Build for arm64:  (Requires Docker Buildx setup capable of building for arm64, often via QEMU)
      ```shell script
      # Build the image targeting linux/arm64
      docker buildx build --platform linux/arm64 --build-arg TARGET_ARCH=arm64 -t sharp-layer-builder-arm64 --load .

      # Create output directory
      mkdir -p dist/arm64

      # Copy the generated zip file from the container
      docker run --rm -v "$(pwd)/dist/arm64":/output sharp-layer-builder-arm64 \
      cp /build/dist/sharp-layer-arm64.zip /output/
      ```
   + The resulting ZIP files will be in dist/x64 and dist/arm64 respectively.

4. Publishing Layers to AWS
   + After obtaining the .zip files (either downloaded from Releases or built locally), you can publish them as Lambda Layers in your AWS account using the AWS CLI:
      + Publish the x86_64 Layer:
         ```sh
         aws lambda publish-layer-version \
            --layer-name sharp-v0-34-x64 \
            --description "Sharp v0.34 (Napi) layer for x86_64" \
            --license-info "Apache-2.0" \
            --zip-file fileb://sharp-layer-x64.zip \
            --compatible-runtimes nodejs18.x nodejs20.x nodejs22.x \
            --compatible-architectures x86_64
         ```
      + Publish the arm64 Layer:
         ```sh
         aws lambda publish-layer-version \
            --layer-name sharp-v0-34-arm64 \
            --description "Sharp v0.34 (Napi) layer for arm64" \
            --license-info "Apache-2.0" \
            --zip-file fileb://sharp-layer-arm64.zip \
            --compatible-runtimes nodejs18.x nodejs20.x nodejs22.x \
            --compatible-architectures arm64
         ```