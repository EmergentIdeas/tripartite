
var calculateRelativePath = require('./calculate-relative-path')

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

function cloneArray(ar) {
	var consumed = []
	for(var i = 0; i < ar.length; i++) {
		consumed.push(ar[i])
	}
	return consumed
}

/* Evaluate in context having been called so that this === cc (current context */
function evaluateInContext(cc, ex, dataFunctions, globalData) {
	dataFunctions = dataFunctions || {}
	globalData = globalData || cc || {}
	
	with ({
		'$globals': globalData 
	}) {
		with (dataFunctions) {
			with (cc) {
				try {
					return eval(ex);
				} catch(e) {
					return null;
				}
			}
		}
	}
}

let stackDepth = 0

function callCallback(callback) {
	if(callback) {
		if(stackDepth < 10) {
			stackDepth++
			return callback()
		}
		else {
			stackDepth = 0;
			if(process && process.nextTick) {
				process.nextTick(callback)
			}
			else {
				setTimeout(callback)
			}
		}
	}
}


function makeTemplate(transformationFunction) {
	let f = function(thedata, globalData) {
		if(arguments.length > 1 && arguments[1] && arguments[1].write) {
			// This is for when a template is invoked with a stream as the second argument
			f.write.apply(this, arguments)
		}
		else {
			return transformationFunction(thedata, globalData)
		}
	}
	f.write = function(thedata, stream, callback) {
		stream.write('' + thedata)
		callCallback(callback)
	}
	return f
}

class ActiveElement {
	constructor(/* the conditional */cd, data, hd, tripartite) {
		/* assign the conditional expression */
		this.ce = cd;
		/* assign the data selector expression */
		this.dse = data;
		
		this.tripartite = tripartite
		
		/* assign the hd expression */
		this.he = hd || 'defaultTemplate'
		
		/* evaluated data */
		this.ed = null;
	}

	run(/* current context */cc, globalData) {
		/* run template */
		var rt = false;
		/* evaluated data */
		this.ed = this.edse(cc, globalData);
		if(this.ce) {
			rt = this.eic(cc, this.ce, globalData);
		}
		else {
			if(this.ed instanceof Array) {
				if(this.ed.length > 0) {
					rt = true;
				}
			}
			else {
				if(this.ed) {
					rt = true;
				}
				else if(!this.dse) {
					rt = true
					this.ed = cc
				}
			}
		}
		
		var at = this.he;
		if(at.charAt(0) == '$') {
			at = this.eic(cc, at.substring(1), globalData);
		}
		if(!at) {
			at = 'defaultTemplate';
		}
		
		// resolve relative template paths
		if(at.indexOf('./') == 0 || at.indexOf('../') == 0) {
			at = calculateRelativePath(this.templateMeta.name, at)
		}
		
		if(rt) {
			if(this.ed instanceof Array) {
				var r = '';
				for(var i = 0; i < this.ed.length; i++) {
					r += this.getTemplate(at)(this.ed[i], globalData || cc);
				}
				return r;
			}
			else {
				return this.getTemplate(at)(this.ed, globalData || cc);
			}
		}
		return '';
	}

	write(/* current context */cc, stream, callback, globalData) {
		/* run template */
		var rt = false;
		/* evaluated data */
		this.ed = this.edse(cc, globalData);
		console.log(this)
		if(this.ce) {
			rt = this.eic(cc, this.ce, globalData);
		}
		else {
			if(this.ed instanceof Array) {
				if(this.ed.length > 0) {
					rt = true;
				}
			}
			else {
				if(this.ed) {
					rt = true;
				}
				else if(!this.dse) {
					rt = true
					this.ed = cc
				}
			}
		}
		
		var at = this.he;
		if(at.charAt(0) == '$') {
			at = this.eic(cc, at.substring(1), globalData);
		}
		if(!at) {
			at = 'defaultTemplate';
		}

		// resolve relative template paths
		if(at.indexOf('./') == 0 || at.indexOf('../') == 0) {
			at = calculateRelativePath(this.templateMeta.name, at)
		}
		
		
		var self = this
		
		
		if(rt) {
			this.tripartite.loadTemplate(at, function(template) {
				var consumed
				if(self.ed instanceof Array) {
					consumed = cloneArray(self.ed)
				}
				else {
					consumed = [self.ed]
				}
				
				var procConsumed = function() {
					if(template) {
						template.write(consumed.shift(), stream, function() {
							if(consumed.length > 0) {
								procConsumed()
							}
							else if(callback) {
								callCallback(callback)
							}
						}, globalData || cc)
					}
					else {
						if(callback) {
							var err = new Error('Cound not load template: ' + at)
							err.templateName = at
							err.type = 'missing template'
							callback(err)
						}
						else {
							console.error('Cound not load template: ' + at)
						}
					}
				}
				
				if(consumed.length > 0) {
					procConsumed()
				}
				else {
					callCallback(callback)
				}
			})
		}
		else {
			callCallback(callback)
		}
	}

	getTemplate(name) {
		return this.tripartite.getTemplate(name)
	}

	/* evaluate data selector expression */
	edse(cc, globalData) {
		if(!this.dse) {
			return null;
		}
		if(this.dse === '$this') {
			return cc;
		}
		return this.eic(cc, this.dse, globalData);
	}

	/* evaluate in context */
	eic = function(cc, ex, globalData) {
		cc = cc || {};
		return this.eicwt.call(cc, cc, ex, this.tripartite.dataFunctions, globalData);
	}

	/* Evaluate in context having been called so that this === cc (current context */
	eicwt(cc, ex, dataFunctions, globalData) {
		return evaluateInContext(cc, ex, dataFunctions, globalData)
	}

}

class Tripartite {
	constructor(options = {}) {
		this.templates = {
			defaultTemplate: makeTemplate(function(thedata) {
				return '' + thedata;
			})
		}
		let {constants = {
			templateBoundary: '__',
			templateNameBoundary: '##'
		}} = options
		this.constants = constants
		
		// This object (if set) will receive the template functions parsed from a script
		// I want to be able to call my templates as global functions, so I've set it
		// to be the window object
		this.secondaryTemplateFunctionObject = options.secondaryTemplateFunctionObject
		
		this.loaders = options.loaders || []
		
		this.dataFunctions = options.dataFunction || {}
	}
	
	addTemplate(name, template) {
		if(typeof template !== 'function') {
			template = this.parseTemplate(template);
		}
		if(typeof template === 'function' && !template.write) {
			template = makeTemplate(template)
		}
		
		this.templates[name] = template;
		template.templateMeta = template.templateMeta || {}
		template.templateMeta.name = name
		return template;
	}

	createBlank() {
		return new Tripartite()
	}

	getTemplate(name) {
		return this.templates[name]
	}

	loadTemplate(name, callback) {
		if(name in this.templates) {
			callback(this.templates[name])
		}
		else {
			let tri = this
			let count = this.loaders.length
			let done = false

			this.loaders.forEach(loader => {
				if(done) {
					return
				}
				loader(name, template => {
					if(done) {
						return
					}
					count--
					if(template) {
						done = true
						tri.addTemplate(name, template)
					}
					else if(count == 0) {
						done = true
						tri.templates[name] = null
					}
					callback(tri.getTemplate(name))
				})
			})
		}
	}
	parseTemplateScript(tx) {
		var tks = this.tts(tx);
		/* current template name */
		var ctn = null;
		for(var i = 0; i < tks.length; i++) {
			var token = tks[i];
			if(token.active) {
				ctn = token.content;
			}
			else {
				if(ctn) {
					var template = this.addTemplate(ctn, this.stw(token.content));
					if(this.secondaryTemplateFunctionObject) {
						this.secondaryTemplateFunctionObject[ctn] = template;
					}
					ctn = null;
				}
			}
		}
	}

	stripTemplateWhitespace(txt) {
		var i = txt.indexOf('\n');
		if(i > -1 && txt.substring(0, i).trim() == '') {
			txt = txt.substring(i + 1);
		}
		i = txt.lastIndexOf('\n');
		if(i > -1 && txt.substring(i).trim() == '') {
			txt = txt.substring(0, i);
		}
		return txt;
	}
	
	/* simple template */
	st(/* conditional expression */ cd, data, /* handling expression */ hd, tripartite, templateMeta) {
		let el = new ActiveElement(cd, data, hd, tripartite);
		el.templateMeta = templateMeta
		

		var f = function(cc, globalData) {
			if(arguments.length > 1 && arguments[1] && arguments[1].write) {
				el.write.apply(el, arguments)
			}
			else {
				return el.run(cc, globalData);
			}
		}
		f.templateMeta = templateMeta
		
		f.write = function(cc, stream, callback, globalData) {
			el.write(cc, stream, callback, globalData)
		}
		return f
	}
	pt(tx) {
		return this.parseTemplate(tx)
	}
	/* parse template */
	parseTemplate(tx) {
		var tks = this.tt(tx);
		var pt = [];
		var templateMeta = {}
		
		for(var i = 0; i < tks.length; i++) {
			var tk = tks[i];
			if(tk.active) {
				pt.push(this.tap(tk.content, templateMeta));
			}
			else {
				if(tk.content) {
					pt.push(tk.content);
				}
			}
		}
		
		var t = function(cc, globalData) {
			if(arguments.length > 1 && arguments[1] && arguments[1].write) {
				t.write.apply(t, arguments)
			}
			else {
				var r = '';
				for(var i = 0; i < pt.length; i++) {
					if(typeof pt[i] === 'string') {
						r += pt[i];
					}
					else {
						r += pt[i](cc, globalData);
					}
				}
				return r;
			}
		}
		
		t.templateMeta = templateMeta
		
		t.write = function(cc, stream, callback, globalData) {
			var consumed = cloneArray(pt)
			var lastError
			
			var procConsumed = function() {
				var unit = consumed.shift()
				if(typeof unit === 'string') {
					stream.write(unit)
					if(consumed.length > 0) {
						procConsumed()
					}
					else if(callback) {
						callCallback(callback)
					}
				}
				else {
					unit.write(cc, stream, function(err) {
						if(err && stream.continueOnTripartiteError) {
							lastError = err
						}
						
						if(err && callback && !stream.continueOnTripartiteError) {
							callback(err)
						}
						else if(consumed.length > 0) {
							procConsumed()
						}
						else if(callback) {
							if(lastError) {
								callback(lastError)
							}
							else {
								callCallback(callback)
							}
						}
					}, globalData)
				}
			}
			
			if(consumed.length > 0) {
				procConsumed()
			}
		}
		
		return t
	}

	/* tokenize active part */
	tokenizeActivePart(tx, templateMeta) {
		var con = null;
		var dat = null;
		var han = null;
		
		/* condition index */
		var ci = tx.indexOf('??');
		if(ci > -1) {
			con = tx.substring(0, ci);
			ci += 2;
		}
		else {
			ci = 0;
		}
		
		/* handler index */
		var hi = tx.indexOf('::');
		if(hi > -1) {
			dat = tx.substring(ci, hi);
			han = tx.substring(hi + 2);
		}
		else {
			dat = tx.substring(ci);
		}
		return this.st(con, dat, han, this, templateMeta);
	}

	tap(tx, templateMeta) {
		return this.tokenizeActivePart(tx, templateMeta)
	}

	/* tokenize template */
	tokenizeTemplate(tx) {
		return this.taib(tx, this.constants.templateBoundary);
	}
	tt(tx) {
		return this.tokenizeTemplate(tx)
	}


	/** tokenize template script */
	tts(tx) {
		return this.taib(tx, this.constants.templateNameBoundary);
	}

	/* tokenize active and inactive blocks */
	taib(tx, /*Active Region Boundary */ bnd) {
		/* whole length */
		var l = tx.length;
		
		/* current position */
		var p = 0;
		
		/* are we in an active region */
		var act = false;
		
		var tks = [];
		
		while(p < l) {
			var i = tx.indexOf(bnd, p);
			if(i == -1) {
				i = l;
			}
			var tk = { active: act, content: tx.substring(p, i)};
			tks.push(tk);
			p = i + 2;
			act = !act;
		}
		
		return tks;
	}

}
var tripartiteInstance = new Tripartite()

if(typeof window != 'undefined') {
	tripartiteInstance.secondaryTemplateFunctionObject = window
}

function addCallbackToPromise(promise, callback) {
    if(callback) {
        promise = promise.then((obj) => {
            callback(null, obj)
        }).catch((err) => {
            callback(err)
        })
    }

    return promise
}
          

if(typeof module !== 'undefined') {
	module.exports = tripartiteInstance
}
else {
	window.Tripartite = tripartiteInstance
}

if(typeof global != 'undefined') {
	if(!global.Tripartite) {
		global.Tripartite = Tripartite
	}
	if(!global.tripartite) {
		global.tripartite = tripartiteInstance
	}
}

