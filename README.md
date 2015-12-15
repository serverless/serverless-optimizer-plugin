Serverless Optimizer Plugin
=============================

**Note:** Rquires Serverless *v0.0.13* or higher.

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

