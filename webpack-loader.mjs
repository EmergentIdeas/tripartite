
export default function tripartiteLoader(source, two, three) {
	let templateName = this.resourcePath

	let dirName = this.context

	if(!source) {
		return ''
	}
	if (templateName.endsWith('.tmpl')) {
		var out = 'var tri = require("tripartite"); var t = "' + escape(source) + '"; \n' +
			'module.exports = t; '

		return out

	}
	else {
		if (dirName.indexOf('node_modules') > -1) {
			var start = dirName.substring(0, dirName.indexOf('node_modules'))
			if (templateName.indexOf(start) == 0) {
				templateName = templateName.substring(start.length)
			}
		}
		if (templateName.indexOf(dirName) == 0) {
			templateName = templateName.substring(dirName.length)
		}
		if (templateName.indexOf('node_modules/') == 0) {
			templateName = templateName.substring('node_modules/'.length)
		}
		if (templateName.indexOf('./') == 0) {
			templateName = templateName.substring(2)
		}
		if (templateName.indexOf('/') == 0) {
			templateName = templateName.substring(1)
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
