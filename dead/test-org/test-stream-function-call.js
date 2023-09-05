var tri = require('../helpers/tri-with-loader')

require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert

var streamBuffers = require('stream-buffers')
var out = new streamBuffers.WritableStreamBuffer({
    initialSize: (100 * 1024),   // start at 100 kilobytes. 
    incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows. 
})

tri.addTemplate('fun1', function(cc) {
	if(cc) {
		return cc.toString().toLowerCase()
	}
	return ''
})

describe("function used through stream writing", function() {
	it("run function with this", function(done) {
		var fctest = tri.pt("__this::fun1")
		fctest('Dan', out, function() {
			assert.equal(out.getContentsAsString(), 'dan')
			done()
		})		
	})
})


