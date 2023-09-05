
let ActiveElement = require('./active-element')
let ExecutionContext = require('./execution-context')
let evaluateInContext = require('./evaluate-in-context')

class ExecutionContextAwait extends ExecutionContext {
	async _run(template, data, callback) {
		let parts = [...template.parts].reverse()
		while (parts.length > 0) {
			let part = parts.pop()
			if (typeof part === 'string') {
				this.output(part)
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
					if (part.conditionalExpression) {
						let result = evaluateInContext(data, part.conditionalExpression, this.dataFunctions, this.initialData)
						if (result) {
							conditionalResult = true
						}
					}
					else {
						// This means we're evaluating the data expression to see if we should run the template
						resultData = evaluateInContext(data, part.dataExpression, this.dataFunctions, this.initialData)
						if (resultData === null || resultData === undefined) {
							conditionalResult = false
						}
						else if (typeof resultData === 'number') {
							// if the result is a number, any number, we want to output it
							// unless the number is from the conditional expression, in which
							// case we want to evaluate it as truthy
							conditionalResult = true
						}
						else if (Array.isArray(resultData) && resultData.length > 0) {
							conditionalResult = true
						}
						else if (resultData) {
							conditionalResult = true
						}
					}
				}


				if (conditionalResult) {
					if (part.dataExpression && resultData === undefined) {
						resultData = evaluateInContext(data, part.dataExpression, this.dataFunctions, this.initialData)
					}
					if (resultData === null || resultData === undefined) {
						resultData = data
					}

					let handlingExpression = this._resolveHandlingExpression(template, part.handlingExpression, data)
					let handlingTemplate
					let children = (Array.isArray(resultData) ? [...resultData] : [resultData]).reverse()

					if (handlingExpression in this.tripartite.templates) {
						handlingTemplate = this.tripartite.getTemplate(handlingExpression)
						if (handlingTemplate) {
						}
						else {
							// the template has been loaded before but is empty
							if (!this.continueOnTripartiteError) {
								throw new Error('Could not load template: ' + handlingExpression)
							}
						}

					}
					else {
						let template = await this._useLoadTemplate(handlingExpression)
						if (!template) {
							let msg = 'Could not load template: ' + handlingExpression
							console.error(msg)
							if (this.continueOnTripartiteError) {
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
						}
					}
					while(children.length > 0) {
						let child = children.pop()
						await this._run(handlingTemplate, child)
					}
				}
			}
			else if (typeof part === 'function') {
				if (part.write) {
					await this._useWriteFunction(part, data)
				}
				else {
					this.output(part(data))
				}
			}

		}
		if (callback) {
			callback()
		}

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

		let p = this._run(this.template, this.initialData, ourCallback)
		if(ourCallback) {
			p.then(ourCallback)
		}

		return this.destination
	}
	
	async _useLoadTemplate(handlingExpression) {
		return new Promise((resolve, reject) => {
			let handlingTemplate = this.tripartite.getTemplate(handlingExpression)
			resolve(handlingTemplate)
		})
	}
	async _useWriteFunction(part, data) {
		return new Promise((resolve, reject) => {
			part.write(data, this.destination, () => {
				resolve()
			})
		})
	}


}

module.exports = ExecutionContextAwait