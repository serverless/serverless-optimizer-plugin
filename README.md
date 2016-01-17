Serverless Optimizer Plugin
=============================

Browserifies, minifies your Serverless Node.js Functions on deployment, and more!

Reducing the file size of your AWS Lambda Functions allows AWS to provision them more quickly, speeding up the response time of your Lambdas.  Smaller Lambda sizes also helps you develop faster because you can upload them faster.  This Severless Plugin is absolutely recommended for every project including Lambdas with Node.js.

**Note:** Requires Serverless *v0.1.0* or higher.

###Setup

* Install via npm in the root of your Serverless Project:
```
npm install serverless-optimizer-plugin --save
```

* In the `custom` property of either your `s-component.json` or `s-function.json` add an optimize property.

```
"custom": {
	"optimize": true
}
```

* Add the plugin to the `plugins` array in your Serverless Project's `s-project.json`, like this:

```
plugins: [
    "serverless-plugin-optimizer"
]
```

* All done!

Adding the `custom.optimize` property in `s-component.json` applies the optimization setting to ALL functions in that component.  Adding the `custom.optimize` property to `s-function.json` applies the optimization setting to ONLY that specific function.  You can use `custom.optimize` in both places.  The `custom.optimize` setting in `s-function.json` will override the setting in `s-component.json`.

We're currently working on adding support for Babelify and Typsecript.  Check back for updates!
