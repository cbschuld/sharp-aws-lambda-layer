# AWS Sharp layer

This AWS lambda layer contains a pre-built [sharp](https://www.npmjs.com/package/sharp) **v0.32 (Flow)** npm library.
It is optimized for the most frugal space usage possible. Includes support for Node 16 and Node 18.

## Dependencies

- Docker

## AWS Server - Installs

```sh
sudo yum install docker git wget curl
sudo systemctl start docker
```

# AWS Repository Description

This serverless application provides a Lambda Layer that includes the [sharp](https://sharp.pixelplumbing.com/) image processing library for Node.js. The original work is from Paul Spencer, this is a fork of his work but with Node16.x, Node 18.x & v0.32 (flow)

The motivation for this layer is two-fold:

You need to bundle the x86 binaries for libvips with sharp when installing it, this is difficult on MacOS
The library size is big enough to make the function not editable in the Lambda console. To use this layer in a Node.js lambda function, simply add this layer to your stack. The published version of this layer will track the version of sharp that is available.

# AWS Repository License

http://www.apache.org/licenses/LICENSE-2.0

# Getting

A pre-built layer zip file is available on the [Releases page](../../releases), alongside the size of the layer.

# Building

## Steps

1. Clone the repo:
   ```shell script
   git clone git@github.com:cbschuld/sharp-aws-lambda-layer.git
   cd sharp-aws-lambda-layer/
   ```
1. Install dependencies:
   ```shell script
   docker run -v "$PWD":/var/task public.ecr.aws/sam/build-nodejs18.x:latest npm --no-optional --no-audit --progress=false install
   ```
1. Build the layer:
   ```shell script
   docker run -v "$PWD":/var/task public.ecr.aws/sam/build-nodejs18.x:latest node ./node_modules/webpack/bin/webpack.js
   ```
1. Perform a smoke-test:
   ```shell script
   docker run -w /var/task/dist/nodejs -v "$PWD":/var/task public.ecr.aws/sam/build-nodejs18.x:latest node -e "console.log(require('sharp'))"
   ```
1. Import created layer into your AWS account:
   ```shell script
   aws --profile=tintable lambda publish-layer-version --layer-name sharp-v0-32 --description "Sharp layer - v0.32 (Flow)" --license-info "Apache License 2.0" --zip-file fileb://sharp-layer-v0-32.zip --compatible-runtimes nodejs16.x nodejs18.x --compatible-architectures x86_64
   ```
