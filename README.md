Serverless Optimizer Plugin
=============================
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

Browserifies, minifies your Serverless Node.js Functions on deployment, and more!

Reducing the file size of your AWS Lambda Functions allows AWS to provision them more quickly, speeding up the response time of your Lambdas.  Smaller Lambda sizes also helps you develop faster because you can upload them faster.  This Severless Plugin is absolutely recommended for every project including Lambdas with Node.js.

**Note:** Requires Serverless *v0.5.0* or higher.

### Setup

* Install via npm in the root of your Serverless Project:
```
npm install serverless-optimizer-plugin --save
```

* Add the plugin to the `plugins` array in your Serverless Project's `s-project.json`, like this:

```
plugins: [
    "serverless-optimizer-plugin"
]
```

* In the `custom` property of your `s-function.json` add an optimize property.

```
"custom": {
    "optimize": true
}
```

* If you rely on the **aws-sdk**, be sure to read the **Common Pitfalls** section.

* All done!

### Configuration Options

Configuration options can be used by setting the `optimize` property to an object instead of a boolean value. The following options are available:

* **disable** - When set to `true`, this will disable optimizer. This is effectively the same as setting the `optimize` property to `false`, but it does not require the deletion of any other configuration values within the `optimize` object. This is a good option for temporarily disabling while debugging.

```
"custom": {
    "optimize": {
        "disable": true
    }
}
```

* **excludeStage** - When set to a `string` or `[string]`, optimizer will be disabled for the specified stage(s). This is beneficial if you do not want optimizer to run on a specific stage to aid in debugging.

```
"custom": {
    "optimize": {
        "excludeStage": ["dev", "test"]
    }
}
```

* **excludeRegion** - When set to a `string` or `[string]`, optimizer will be disabled for the specified region(s).

```
"custom": {
    "optimize": {
        "excludeRegion": ["us-east-1"]
    }
}
```

### Browserify Options

Browserify options can be included as normal configuration options to the `optimize` object. The following options are supported:

* handlerExt
* includePaths
* requires
* plugins
* transforms
* exclude
* ignore
* extensions

For more information on these options, please visit the [Browserify Documentaton](https://github.com/substack/node-browserify#usage).

### Common Pitfalls

* **aws-sdk** does not play well with Browserify. If the aws-sdk is used anywhere in your code, even if it is not within node_modules or package.json, you may receive an error similar to:

`Uncaught {"errorMessage":"Cannot find module '/usr/lib/node_modules/aws-sdk/apis/metadata.json'"...`

To fix this, the aws-sdk should be excluded by using the `exclude` Browserify option. Since the aws-sdk is always available to an AWS Lambda, it should never need to be included.

```
"custom": {
    "optimize": {
        "exclude": ["aws-sdk"]
    }
}
```

## ES6 with Babel and Babelify

Bundles are packaged with Browserify, and can be transformed to support ES6 features with Babelify.


Install babelify within the root context of your project:

    npm install babelify --save

    npm install babel-preset-es2015 --save


Add the babelify transform to `s-function.json`:

```javascript
{
    "name": "myfunc",
    "runtime": "nodejs",
    "custom": {
        "optimize": {
            "exclude": [ "aws-sdk" ],
            "transforms": [
                {
                    "name": "babelify",
                    "opts": {
                        "presets": [
                            "es2015"
                        ]
                    }
                }
            ]
        }
    }
}

```

We're currently working on adding support for Typescript. Check back for updates!
