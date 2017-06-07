var tri = require('../tripartite')
var fs = require('fs')


tri.loaders.push(function(name, callback) {
	fs.readFile('./test/' + name + '.tri', function(err, buffer) {
		if(!err) {
			callback(buffer.toString())
		}
		else {
			callback('')
		}
	})
})

module.exports = tri