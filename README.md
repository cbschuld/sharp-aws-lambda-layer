# AWS Sharp layer

This AWS lambda layer contains a pre-built [sharp](https://www.npmjs.com/package/sharp) **v0.34 (Napi)** npm library.
It is optimized for the most frugal space usage possible. Includes support for Node 18, Node 20 and Node 22.

## Dependencies

- Docker

## AWS Server - Installs

```sh
sudo yum install docker git wget curl
sudo systemctl start docker
```

# AWS Repository Description

This serverless application provides a Lambda Layer that includes the [sharp](https://sharp.pixelplumbing.com/) image processing library for Node.js. The original work is from Paul Spencer, this is a fork of his work but with Node18.x, Node 20.x and Node 22.x & v0.34 (napi)

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
   docker run -v "$PWD":/var/task public.ecr.aws/sam/build-nodejs22.x:latest npm --no-optional --no-audit --progress=false install
   ```
1. Build the layer:
   ```shell script
   docker run -v "$PWD":/var/task public.ecr.aws/sam/build-nodejs22.x:latest node ./node_modules/webpack/bin/webpack.js
   ```
1. Perform a smoke-test:
   ```shell script
   docker run -w /var/task/dist/nodejs -v "$PWD":/var/task public.ecr.aws/sam/build-nodejs22.x:latest node -e "console.log(require('sharp'))"
   ```
1. Import created layer into your AWS account:
   ```shell script
   aws --profile=tintable lambda publish-layer-version --layer-name sharp-v0-32 --description "Sharp layer - v0.34 (Napi)" --license-info "Apache License 2.0" --zip-file fileb://sharp-layer-v0-32.zip --compatible-runtimes nodejs18.x nodejs20.x nodejs22.x --compatible-architectures x86_64
   ```
