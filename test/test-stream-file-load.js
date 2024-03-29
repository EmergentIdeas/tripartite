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
		it("relative template streaming", function(done) {
			var here = tri.addTemplate('one/here', "now I'm here __::./there__")
			var there = tri.addTemplate('one/there', "now I'm there")
			here({}, out, function() {
				try {
					assert.equal(out.getContentsAsString(), "now I'm here now I'm there")
					done()
				} catch(ex) {
					done(ex)
				}
			})
		})
		
		it("globals reference", function(done) {
			var second = tri.addTemplate('second', '__num1__ __num2__ __$globals.num2__')
			var first = tri.pt("__abc::second__ __$globals.num2__")
			first({abc: {num1: 1, num2: 3}, num2: 2}, out, function() {
				try {
					assert.equal(out.getContentsAsString(), "1 3 2 2")
					done()
				} catch(ex) {
					done(ex)
				}
			})
		})	
	})
	describe('missing data allows templates to continue', function() {
		it('tests to be sure templates are loaded', function(done) {
			// Make sure that a missing value for evaluation does not stop the 
			// templates from continuing to execute in stream mode.
			console.time('tests to be sure templates are loaded')
			var hello = tri.pt("hello, __name__ __name.length__! __::test-templates/f1__")
			
			hello({firstName: 'Dan'}, out, function() {
				try {
					console.timeEnd('tests to be sure templates are loaded')
					assert.equal(out.getContentsAsString(), 'hello,  ! world there')
					done()
				} catch(ex) {
					done(ex)
				}
			})
		})

		it("calculated template found", function(done) {
			console.time('calculated template found')
			tri.addTemplate('stars', '**__this__**')
			var hello = tri.parseTemplate("hello, __name::$temp__!")

			hello({name: 'Dan', cond: true, temp: 'stars'}, out, function() {
				try {
					console.timeEnd('calculated template found')
					assert.equal(out.getContentsAsString(), 'hello, **Dan**!')
					done()
				} catch(ex) {
					done(ex)
				}
			})   
		})	
		it("calculated template missing", function(done) {
			console.time('calculated template missing2')
			tri.addTemplate('stars', '**__this__**')
			var hello = tri.parseTemplate("hello, __name::$temp__!")

			hello({name: 'Dan', cond: true, temp: 'missing2'}, out, function() {
				try {
					console.timeEnd('calculated template missing2')
					assert.equal(out.getContentsAsString(), 'hello, !')
					done()
				} catch(ex) {
					done(ex)
				}
			})   

		})	
	})

})



