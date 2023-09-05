
let ActiveElement = require('./active-element')
var calculateRelativePath = require('./calculate-relative-path')
let evaluateInContext = require('./evaluate-in-context')

class ExecutionContext {
	/**
	 * 
	 * @param {Tripartite} tripartite 
	 * @param {function} template 
	 * @param {stream} [destination]
	 */
	constructor(tripartite, template, data = {}, destination = '', dataFunctions = {}) {
		this.tripartite = tripartite
		this.template = template
		this.destination = destination
		this.initialData = data
		this.currentData = []
		this.dataFunctions = dataFunctions
		this.continueOnTripartiteError = true
	}

	/**
	 * 
	 * @param {function} [callback] called when done
	 * @returns Returns the string of stream as the result of the operation
	 */
	run(callback) {
		let ourCallback
		if (callback) {
			ourCallback = () => {
				callback(null, this.destination)
			}
		}

		this._run(this.template, this.initialData, ourCallback)

		return this.destination
	}

	_resolveHandlingExpression(template, handlingExpression, data) {
		if (!handlingExpression) {
			handlingExpression = defaultTemplateName
		}
		if (handlingExpression.charAt(0) == '$') {
			// Indicates the handling espression is not a literal template name but is a string which should
			// be evaluated to determine the template name
			handlingExpression = evaluateInContext(data, handlingExpression.substring(1), this.dataFunctions, this.initialData)
		}
		// resolve relative template paths
		if (handlingExpression.indexOf('./') == 0 || handlingExpression.indexOf('../') == 0) {
			handlingExpression = calculateRelativePath(template.templateMeta.name, handlingExpression)
		}

		return handlingExpression
	}

	_run(template, data, callback) {
		let parts = [...template.parts].reverse()
		const processParts = () => {
			if (parts.length > 0) {
				let part = parts.pop()
				if (typeof part === 'string') {
					this.output(part)
					processParts()
				}
				else if (part instanceof ActiveElement) {
					let conditional = part.conditionalExpression || part.dataExpression
					let conditionalResult = false
					let resultData
					if (conditional == null || conditional == undefined || conditional === '') {
						// Because if they didn't specify a condition or data, they probably 
						// just want the template to be run as is
						conditionalResult = true
					}
					else {
						if(part.conditionalExpression) {
							let result = evaluateInContext(data, part.conditionalExpression, this.dataFunctions, this.initialData)
							if (result) {
								conditionalResult = true
							}
						}
						else {
							// This means we're evaluating the data expression to see if we should run the template
							resultData = evaluateInContext(data, part.dataExpression, this.dataFunctions, this.initialData)
							if(resultData === null || resultData === undefined) {
								conditionalResult = false
							}
							else if (typeof resultData === 'number') {
								// if the result is a number, any number, we want to output it
								// unless the number is from the conditional expression, in which
								// case we want to evaluate it as truthy
								conditionalResult = true
							}
							else if(Array.isArray(resultData) && resultData.length > 0) {
								conditionalResult = true
							}
							else if(resultData) {
								conditionalResult = true
							}
						}
					}


					if (conditionalResult) {
						if (part.dataExpression && resultData === undefined) {
							resultData = evaluateInContext(data, part.dataExpression, this.dataFunctions, this.initialData)
						}
						if(resultData === null || resultData === undefined) {
							resultData = data
						}

						let handlingExpression = this._resolveHandlingExpression(template, part.handlingExpression, data)
						let handlingTemplate
						let children = (Array.isArray(resultData) ? [...resultData] : [resultData]).reverse()
						const applyTemplate = () => {
							if (children.length > 0) {
								let child = children.pop()
								this._run(handlingTemplate, child, () => {
									applyTemplate()
								})
							}
							else {
								processParts()
							}
						}

						if(handlingExpression in this.tripartite.templates) {
							handlingTemplate = this.tripartite.getTemplate(handlingExpression)
							if (handlingTemplate) {
								applyTemplate()
							}
							else {
								// the template has been loaded before but is empty
								if (this.continueOnTripartiteError) {
									processParts()
								}
							}
							
						}
						else {
							this.tripartite.loadTemplate(handlingExpression, (template) => {
								if (!template) {
									let msg = 'Could not load template: ' + handlingExpression
									console.error(msg)
									if (this.continueOnTripartiteError) {
										processParts()
									}
									else {
										let err = new Error(msg)
										if (callback) {
											callback(err)
										}
										else {
											throw err
										}
									}
								}
								else {
									handlingTemplate = template
									applyTemplate()
								}
							})
						}
					}
					else {
						processParts()
					}
				}
				else if (typeof part === 'function') {
					if(part.write) {
						part.write(data, this.destination, () => {
							processParts()
						})

					}
					else {
						this.output(part(data))
						processParts()
					}
				}

			}
			else {
				if (callback) {
					callback()
				}
			}
		}

		processParts()
	}

	/**
	 * 
	 * @param {string} value 
	 */
	output(value) {
		if(value === null || value === undefined) {
			return
		}
		if (typeof this.destination === 'string') {
			this.destination += value
		}
		else if (this.destination.write) {
			this.destination.write(value)
		}
	}
}


module.exports = ExecutionContext