var tri = require('../helpers/tri-with-loader')

require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert

var streamBuffers = require('stream-buffers')
var out = new streamBuffers.WritableStreamBuffer({
    initialSize: (100 * 1024),   // start at 100 kilobytes. 
    incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows. 
})

describe("template loaded from stream", function() {
	describe('loading test 1', function() {
		it('tests to be sure templates are loaded', function(done) {
			var hello = tri.pt("hello, __name__! __::test-templates/f1__")
			
			hello({name: 'Dan'}, out, function() {
				try {
					assert.equal(out.getContentsAsString(), 'hello, Dan! world there')
					done()
				} catch(ex) {
					done(ex)
				}
			})
		})
	})
})



