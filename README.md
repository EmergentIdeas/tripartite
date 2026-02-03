# Tripartite

A micro templating tool.

## Install

```bash
npm install tripartite
```

## Usage 

```js



```


Include a template directly in a client side script by adding to the package.json:
```json
	"browserify": {
		"transform": [
			"tripartite/browserify-transform"
		]
	}
```

or in a webpack config like:

```js
let pagesConf = {
    entry: './source.js',
    output: {
        filename: 'output.js',
        path: path.resolve(__dirname, 'public/js'),
    },
    module: {
        rules: [
            { test: /\.tmpl$/, use: 'tripartite/webpack-loader.mjs' }
            , { test: /\.tri$/, use: 'tripartite/webpack-loader.mjs' }
            , { test: /\.txt$/i, use: 'raw-loader' }
        ],
    }
}
```

This adds the template to the global tripartite instance and returns the parsed and
runnable template function.

To load and use a template directly, you can run:

```js
let template = require('./template.tri')
```
