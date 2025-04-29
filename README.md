# AWS Sharp Lambda Layer (x86\_64 and arm64)

[![Build Layers](https://github.com/cbschuld/sharp-aws-lambda-layer/workflows/Build%20Layers/badge.svg)](https://github.com/cbschuld/sharp-aws-lambda-layer/actions?query=workflow:"Build+Layers")
[![GitHub release](https://img.shields.io/github/release/cbschuld/sharp-aws-lambda-layer?include_prereleases=&sort=semver&color=blue)](https://github.com/cbschuld/sharp-aws-lambda-layer/releases/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue)](#license)
[![issues - sharp-aws-lambda-layer](https://img.shields.io/github/issues/cbschuld/sharp-aws-lambda-layer)](https://github.com/cbschuld/sharp-aws-lambda-layer/issues)

Prebuilt Sharp AWS Lambda Layer for Node.js 18, 20, and 22. Optimized, bundled, and minified Sharp binaries for x86_64 and arm64 architectures. Improve cold starts with lightweight Sharp builds, ready for Serverless Framework, AWS SAM, and SST deployments.

## About

A pre-built [sharp](https://www.npmjs.com/package/sharp) AWS Lambda layer optimized for cold start performance.

- Supports **x86\_64** and **arm64** architectures.
- Compatible with Node.js **18.x**, **20.x**, and **22.x** runtimes.
- Automatically updated and tested using GitHub Actions.
- Bundled and minified with `esbuild`.
- Lightweight layer files (\~7MB).

## Features

- Separate builds for `x64` and `arm64`.
- Daily checks designed to auto-release on new `sharp` versions.
- Optimized for cold starts on AWS Lambda.
- Ideal for use with AWS CDK, AWS SAM, SST and Serverless Framework.

## Why Separate Builds?

Bundling dependencies and targeting the correct architecture reduces cold start latency dramatically. See [Optimizing Node.js dependencies in AWS Lambda](https://aws.amazon.com/blogs/compute/optimizing-node-js-dependencies-in-aws-lambda/) for more.

## Download

[**Releases**](https://github.com/cbschuld/sharp-aws-lambda-layer/releases) include:

- [release-arm64.zip](https://github.com/cbschuld/sharp-aws-lambda-layer/releases/latest/download/release-arm64.zip)
- [release-x64.zip](https://github.com/cbschuld/sharp-aws-lambda-layer/releases/latest/download/release-x64.zip)
- [release-all.zip](https://github.com/cbschuld/sharp-aws-lambda-layer/releases/latest/download/release-all.zip)

Each file contains a ready-to-use layer for deployment.

## Usage

### Basic Import

```javascript
import sharp from 'sharp';
```

### AWS Lambda Layer Setup

Check [AWS Lambda Layers documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html).

### Publishing a Layer (CLI Example)

```sh
aws lambda publish-layer-version \
  --layer-name sharp-lambda-x64 \
  --description "Sharp Layer for x86_64" \
  --license-info "Apache-2.0" \
  --zip-file fileb://release-x64.zip \
  --compatible-runtimes nodejs18.x nodejs20.x nodejs22.x \
  --compatible-architectures x86_64

aws lambda publish-layer-version \
  --layer-name sharp-lambda-arm64 \
  --description "Sharp Layer for arm64" \
  --license-info "Apache-2.0" \
  --zip-file fileb://release-arm64.zip \
  --compatible-runtimes nodejs18.x nodejs20.x nodejs22.x \
  --compatible-architectures arm64
```

### AWS CDK Usage Example

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sharpLayer = new lambda.LayerVersion(this, 'SharpLayer', {
      code: lambda.Code.fromAsset('layers/sharp'),
      compatibleArchitectures: [lambda.Architecture.ARM_64],
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_18_X,
        lambda.Runtime.NODEJS_20_X,
        lambda.Runtime.NODEJS_22_X,
      ],
      description: 'Sharp Lambda Layer for ARM64',
      license: 'Apache-2.0',
    });

    const myFunction = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda-handler-directory'),
      architecture: lambda.Architecture.ARM_64,
      layers: [sharpLayer],
    });
  }
}
```

### SST Usage Example

```javascript
layers: [
  new lambda.LayerVersion(stack, "SharpLayer", {
    code: lambda.Code.fromAsset("layers/sharp"),
    compatibleArchitectures: [lambda.Architecture.ARM_64],
  })
]
```

### Serverless Framework Usage Example

In your `serverless.yml`:

```yaml
functions:
  myFunction:
    handler: handler.main
    runtime: nodejs20.x
    architecture: arm64
    layers:
      - arn:aws:lambda:us-west-2:123456789012:layer:sharp-v0-34-arm64:1
```

### AWS SAM Usage Example

```yaml
SharpLayer:
  Type: AWS::Serverless::LayerVersion
  Properties:
    LayerName: sharp
    ContentUri: layers/sharp/release-arm64.zip
    CompatibleArchitectures:
      - arm64
    CompatibleRuntimes:
      - nodejs18.x
      - nodejs20.x
      - nodejs22.x
```

## Building (Optional)

Layers are built automatically by GitHub Actions when a new Sharp version is released.

If needed manually:

```sh
git clone https://github.com/cbschuld/sharp-aws-lambda-layer.git
cd sharp-aws-lambda-layer
# Follow the GitHub Actions workflows for build instructions.
```

## License

Released under [Apache 2.0](/LICENSE) by [@cbschuld](https://github.com/cbschuld).

## References

- [Sharp Installation Guide](https://sharp.pixelplumbing.com/install#aws-lambda)
- [AWS Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [Optimizing Node.js Dependencies in Lambda](https://aws.amazon.com/blogs/compute/optimizing-node-js-dependencies-in-aws-lambda/)
