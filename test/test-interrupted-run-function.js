var tri = require('../helpers/tri-with-loader')

require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert

var streamBuffers = require('stream-buffers')
var out = new streamBuffers.WritableStreamBuffer({
    initialSize: (100 * 1024),   // start at 100 kilobytes. 
    incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows. 
})

describe("interupted run functions", function() {
		it('tests to be sure template runs to completion with callback', function(done) {
			var hello = tri.addTemplate('hello', "__this::test-templates/f3__")
			hello(['Dan', 'Kolz'], (err, content) => {
				assert.equal(content, ',Dan,Kolz')
				done()

			})
			
		})
		it("try the run function, checking for template loads", async function() {
			delete tri.templates['test-templates/f3']
			delete tri.templates['test-templates/f4']

			let hello = tri.addTemplate('hello', "__this::test-templates/f3__")

			let content = hello(['Dan', 'Kolz'])
			assert.equal(content, '')

			content = await hello.run(['Dan', 'Kolz'])
			assert.equal(content, ',Dan,Kolz')
		})
		it("try the run function, checking for deep call stacks", async function() {
			let hello = tri.addTemplate('hello', "__this::test-templates/f3__")
			let data = []
			for(let i = 0; i < 2000; i++) {
				data.push(i)
			}

			let content
			let parts
			let last

			content = await hello.run(data)
			parts = content.split(',')
			last = parts.pop()
			
			// we should get the last number here
			assert.equal(last, '1999')

			content = hello(data)
			parts = content.split(',')
			while(!parts[parts.length - 1]) {
				parts.pop()
			}
			last = parts.pop()
			// we should get some point in the output stream where the call stack is too deep and the function just returns
			assert.equal(last, '70')

		})
})



