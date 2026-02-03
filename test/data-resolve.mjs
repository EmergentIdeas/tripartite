import resolveDataPath from '../resolve-data-path.js';
import evaluateInContext from '../evaluate-in-context.js';

import test from 'node:test';
import assert from 'node:assert'


let dat1 = {
	a: {
		b: 2,
		c: {
			d: 'd'
		}
	},
	e: 'hello'
}

test("data path", async (t) => {

	await t.test('calculate parts', async (t) => {
		assert.equal(resolveDataPath(dat1, 'a.b'), 2)
		assert.equal(resolveDataPath(dat1, 'e'), 'hello')

	})
	await t.test('performance', async (t) => {
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
