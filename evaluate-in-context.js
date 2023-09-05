
const resolveDataPath = require('./resolve-data-path')
function evaluateInContext(context, expression, dataFunctions, globalData) {
	if (!expression) {
		return null
	}
	if (typeof expression === 'string') {
		expression = expression.trim()
	}

	if (expression === '$this' || expression === 'this') {
		return context
	}
	if (typeof context === 'object' && expression in context) {
		return context[expression]
	}
	if (expression === '""' || expression === "''") {
		return ''
	}
	let resolved = resolveDataPath(context, expression)
	if (resolved === null || resolved === undefined) {
		resolved = resolveDataPath({
			'$globals': globalData
		}, expression)
	}
	if (resolved === null || resolved === undefined) {
		resolved = _evaluateInContext.call(context, context, expression, dataFunctions, globalData)
	}
	return resolved
}

function _evaluateInContext(context, expression, dataFunctions, globalData) {
	dataFunctions = dataFunctions || {}
	globalData = globalData || {}


	with ({
		'$globals': globalData
	}) {
		with (dataFunctions) {
			with (context) {
				try {
					return eval(expression);
				} catch (e) {
					return null;
				}
			}
		}
	}
}

module.exports = evaluateInContext