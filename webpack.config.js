const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

/* need to install:

npm i --save-dev webpack-cli node-polyfill-webpack-plugin raw-loader

*/

let mode = 'development'
// let mode = 'production'
 
let testConf = {
	entry: './client-tests/tests.js',
	mode: mode,
	output: {
		filename: 'test.js',
		path: path.resolve(__dirname, '.'),
	},
	module: {
		rules: [
			{ test: /\.tmpl$/, use: './webpack-loader.mjs' }
			, { test: /\.tri$/, use: './webpack-loader.mjs' }
		],
	},
	resolve: {
		fallback: {
			// stream: require.resolve('stream-browserify'),
		}
	},
	plugins: [
        new NodePolyfillPlugin()
    ]
}

module.exports = [
	testConf
]