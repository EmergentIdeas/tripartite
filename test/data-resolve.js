var tri = require('../tripartite')
require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert
const resolveDataPath = require('../resolve-data-path')
const evaluateInContext = require('../evaluate-in-context')

let dat1 = {
	a: {
		b: 2,
		c: {
			d: 'd'
		}
	},
	e: 'hello'
}

describe("data path", function() {
	it("calculate parts", function() {
		
		assert.equal(resolveDataPath(dat1, 'a.b'), 2)
		assert.equal(resolveDataPath(dat1, 'e'), 'hello')
	})
	
	it("performance", function() {
		
		console.time('resolve')
		for(let i = 0; i < 10000; i++) {
			resolveDataPath(dat1, 'a.c.d')
		}
		console.timeEnd('resolve')

		console.time('eval')
		for(let i = 0; i < 10000; i++) {
			evaluateInContext(dat1, 'a.c.d')
		}
		console.timeEnd('eval')
	})
})




