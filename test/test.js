var tri = require('../tripartite')
require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert

describe("standard parsing and execution", function() {
	it("simple replacement", function() {
		var hello = tri.pt("hello, __name__!")
		assert.equal('hello, Dan!', hello({name: 'Dan'}))
	})
	
	it("conditional run", function() {
		var hello = tri.pt("hello, __cond??name__!")
		assert.equal('hello, Dan!', hello({name: 'Dan', cond: true}))
		assert.equal('hello, !', hello({name: 'Dan', cond: false}))
	})
	
	it("sub template", function() {
		tri.addTemplate('stars', '**__this__**')
		tri.addTemplate('wonder', 'wonder')
		var hello = tri.pt("hello, __cond??name::stars__!")

		assert.equal('hello, **Dan**!', hello({name: 'Dan', cond: true}))
		assert.equal('hello, !', hello({name: 'Dan', cond: false}))
	})	
	
	it("globals reference", function() {
		tri.addTemplate('second', '__num1__ __num2__ __$globals.num2__')
		var first = tri.pt("__abc::second__ __$globals.num2__")

		assert.equal('1 3 2 2', first({abc: {num1: 1, num2: 3}, num2: 2}))
	})	
	
	it("blank data", function() {
		var blankData = tri.pt('some __::wonder__')
		assert.equal('some wonder', blankData('blank'))
		var blankData = tri.pt('some __::stars__')
		assert.equal('some **blank**', blankData('blank'))
	})
	
	it("missing template", function() {
		var tri2 = tri.createBlank()
		var nostars = tri2.pt('no stars __::stars__')
		try {
			nostars()
			throw new Exception('missing template not caught')
		} catch(e) {
		}
	})
	
	it("json conversion", function() {
		var jsonTest = tri.pt('__({name: "Dan"})::toJson__');
		tri.addTemplate('toJson', function(cc) {
			return JSON.stringify(cc)
		})
		assert.equal('{"name":"Dan"}', jsonTest())
	})
	
	it("relative template", function() {
		var tri2 = tri.createBlank()
		var here = tri2.addTemplate('one/here', "now I'm here __::./there__")
		var there = tri2.addTemplate('one/there', "now I'm there")
		assert.equal("now I'm here now I'm there", here())
	})

})




