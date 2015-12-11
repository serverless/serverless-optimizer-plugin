Serverless Optimizer Plugin
=============================

Currently a work in progress :)  Needs to print debug information but there is currently a bug there.

Looks for the following properties on your Functions in `s-function.json`:

```
"custom": {
	"optimize": {
		"browserify": {
			"babelify": true
		},
		"minify": true
	}
}
```

