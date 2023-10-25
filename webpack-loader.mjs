
export default function tripartiteLoader(source, map, meta) {
	let templateName = this._module.rawRequest


	if(!source) {
		return ''
	}
	if (templateName.endsWith('.tmpl')) {
		var out = 'var tri = require("tripartite"); var t = "' + escape(source) + '"; \n' +
			'module.exports = t; '

		return out

	}
	else {
		while (templateName.indexOf('node_modules') > -1) {
			var start = templateName.indexOf('node_modules')
			templateName = templateName.substring(0, start + 'node_modules/'.length)
		}
		while (templateName.indexOf('../') == 0) {
			templateName = templateName.substring(3)
		}
		if (templateName.indexOf('./') == 0) {
			templateName = templateName.substring(2)
		}
		if (templateName.indexOf('/') == 0) {
			templateName = templateName.substring(1)
		}
		if(templateName.endsWith('.tri')) {
			templateName = templateName.substring(0, templateName.length - 4)
		}
		var out = 'var tri = require("tripartite"); var t = "' + escape(source) + '"; \n' +
			'module.exports = tri.addTemplate("' + templateName + '", t); '

		return out
	}
}
function escape(val) {
	if (typeof (val) != "string") return val;
	return val
		.replace(/[\\]/g, '\\\\')
		.replace(/[\"]/g, '\\"')
		.replace(/[\/]/g, '\\/')
		.replace(/[\b]/g, '\\b')
		.replace(/[\f]/g, '\\f')
		.replace(/[\n]/g, '\\n')
		.replace(/[\r]/g, '\\r')
		.replace(/[\t]/g, '\\t');
}
