var tri = require('../tripartite')
var calculateRelativePath = require('../calculate-relative-path')
require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert

describe("parent path tests", function() {
	it("calculate parts", function() {
		
		assert.equal('three', calculateRelativePath('one/two', '../three'))
		assert.equal('one/three', calculateRelativePath('one/two', './three'))
		assert.equal('one/three', calculateRelativePath('one/two/four/five', '../../three'))
		assert.equal('one/three/four', calculateRelativePath('one/two', './three/four'))
		assert.equal('three', calculateRelativePath('one', '../three'))
	})
	
})




