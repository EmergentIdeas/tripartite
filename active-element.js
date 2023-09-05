
const defaultTemplateName = 'defaultTemplate'

class ActiveElement {
	constructor(conditionalExpression, dataExpression, handlingExpression, tripartite) {
		this.conditionalExpression = conditionalExpression
		this.dataExpression = dataExpression
		this.handlingExpression = handlingExpression || defaultTemplateName
		this.tripartite = tripartite
	}
}

module.exports = ActiveElement