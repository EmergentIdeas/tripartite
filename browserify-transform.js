var through = require('through2');

module.exports = function(file, opts) {
    return through(function(buf, enc, next) {
        var fileName = file.toString()
		var processable = false
		var templateName
		
		if (/\.tri$/.test(fileName)) {
            templateName = fileName.substring(0, fileName.length - 4)
			processable = true
		}
		if (/\.body$/.test(fileName)) {
            templateName = fileName.substring(0, fileName.length - 5)
			processable = true
		}
		if(processable) {	
			if(__dirname.indexOf('node_modules') > -1) {
				var start = __dirname.substring(0, __dirname.indexOf('node_modules'))
				if(templateName.indexOf(start) == 0) {
					templateName = templateName.substring(start.length)
				}
			}
			if(templateName.indexOf(__dirname) == 0) {
				templateName = templateName.substring(__dirname.length)
			}
			if(templateName.indexOf('node_modules/') == 0) {
				templateName = templateName.substring('node_modules/'.length)
			}
			if(templateName.indexOf('./') == 0) {
				templateName = templateName.substring(2)
			}
			if(templateName.indexOf('/') == 0) {
				templateName = templateName.substring(1)
			}
            var out = 'var tri = require("tripartite"); var t = "' + escape(buf.toString('utf8')) + '"; \n' +
                'module.exports = tri.addTemplate("' + templateName + '", t); '
            this.push(out);
        } else {
            this.push(buf.toString('utf8'));
        }
        next();
    });
}

function escape(val) {
    if (typeof(val) != "string") return val;
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
