
var tri = require('../tripartite')
require('mocha')
var assert = require('chai').assert

describe("standard parsing and execution", function() {
	it("simple replacement", function() {
		var hello = tri.parseTemplate("hello, __name__!")
		assert.equal(hello({name: 'Dan'}), 'hello, Dan!')
	})

	it("conditional run", function() {
		var hello = tri.parseTemplate("hello, __cond??name__!")
		assert.equal(hello({name: 'Dan', cond: true}), 'hello, Dan!')
		assert.equal(hello({name: 'Dan', cond: false}), 'hello, !')
	})
	it("sub template", function() {
		tri.addTemplate('stars', '**__this__**')
		tri.addTemplate('wonder', 'wonder')
		var hello = tri.parseTemplate("hello, __cond??name::stars__!")

		assert.equal(hello({name: 'Dan', cond: true}), 'hello, **Dan**!')
		assert.equal(hello({name: 'Dan', cond: false}), 'hello, !')
	})	
	it("calculated template", function() {
		tri.addTemplate('wonder', 'wonder')
		console.time('calculated template found')
		tri.addTemplate('stars', '**__this__**')
		var hello = tri.parseTemplate("hello, __name::$temp__!")
		let result = hello({name: 'Dan', cond: true, temp: 'stars'})
		console.timeEnd('calculated template found')
		assert.equal(result, 'hello, **Dan**!')
	})	
	it("proximate templates", function() {
		tri.addTemplate('stars', '**__this__**')
		tri.addTemplate('wonder', 'wonder')
		var hello2 = tri.parseTemplate("hello, __cond??name::stars____cond??name::stars__!")

		assert.equal(hello2({name: 'Dan', cond: true}), 'hello, **Dan****Dan**!')
		assert.equal(hello2({name: 'Dan', cond: false}), 'hello, !')

		var hello3 = tri.parseTemplate("hello, __cond??name::stars__a__cond??name::stars__!")

		assert.equal(hello3({name: 'Dan', cond: true}), 'hello, **Dan**a**Dan**!')
		assert.equal(hello3({name: 'Dan', cond: false}), 'hello, a!')
	})	
	it("globals reference", function() {
		tri.addTemplate('second', '__num1__ __num2__ __$globals.num2__')
		var first = tri.parseTemplate("__abc::second__ __$globals.num2__")

		assert.equal(first({abc: {num1: 1, num2: 3}, num2: 2}), '1 3 2 2')
	})	
	it("blank data", function() {
		var blankData = tri.parseTemplate('some __::wonder__')
		assert.equal(blankData('blank'), 'some wonder')
		assert.equal(blankData(), 'some wonder')
		assert.equal(blankData(null), 'some wonder')
		assert.equal(blankData({}), 'some wonder')
		assert.equal(blankData([]), 'some ')
		assert.equal(blankData([1]), 'some wonder')

		var blankData = tri.parseTemplate('some __::stars__')
		assert.equal(blankData('blank'), 'some **blank**')

	})
	
	it("missing template", function() {
		var tri2 = tri.createBlank()
		var nostars = tri2.parseTemplate('no stars __::stars__')
		let templateMissing = true
		try {
			nostars(null, {
				continueOnTripartiteError: false
			})
			templateMissing = false
		} catch(e) {
		}
		
		if(!templateMissing) {
			throw new Error('missing template not caught')
		}
	})
	it("json conversion", function() {
		var jsonTest = tri.parseTemplate('__({name: "Dan"})::toJson__');
		tri.addTemplate('toJson', function(cc) {
			return JSON.stringify(cc)
		})
		assert.equal(jsonTest(), '{"name":"Dan"}')

		jsonTest = tri.parseTemplate('__{name: "Dan"}::toJson__');
		assert.equal(jsonTest(), '"Dan"')
	})
	it("relative template", function() {
		var tri2 = tri.createBlank()
		var here = tri2.addTemplate('one/here', "now I'm here __::./there__")
		var there = tri2.addTemplate('one/there', "now I'm there")
		assert.equal(here(), "now I'm here now I'm there")
	})
})