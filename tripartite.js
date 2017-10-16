
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

var Tripartite = function() {
	this.templates = {
		defaultTemplate: function(thedata) {
			return '' + thedata;
		}
	}
	
	this.templates.defaultTemplate.write = function(thedata, stream, callback) {
		stream.write('' + thedata)
		if(callback) {
			callback()
		}
	}
	
	this.constants = {
		templateBoundary: '__',
		templateNameBoundary: '##'
	}
	
	// This object (if set) will receive the template functions parsed from a script
	// I want to be able to call my templates as global functions, so I've set it
	// to be the window object
	this.secondaryTemplateFunctionObject = null
	
	this.loaders = []
}

var t = Tripartite


t.prototype.addTemplate = function(name, template) {
	if(typeof template !== 'function') {
		template = this.pt(template);
	}
	if(!template.write) {
		var oldFun = template
		template = function(cc) {
			if(arguments.length > 1) {
				template.write.apply(this, arguments)
			}
			else {
				return oldFun(cc)
			}
		}
		template.write = function(cc, stream, callback) {
			stream.write(oldFun(cc))
			if(callback) {
				callback()
			}
		}
	}
	this.templates[name] = template;
	return template;
};

t.prototype.createBlank = function() {
	return new Tripartite()
}

t.prototype.getTemplate = function(name) {
	return this.templates[name]
}

t.prototype.loadTemplate = function(name, callback) {
	if(this.templates[name]) {
		callback(this.templates[name])
		
	}
	else {
		var tri = this
		var count = this.loaders.length
		var done = false
		for(var i = 0; i < this.loaders.length; i++) {
			this.loaders[i](name, function(template) {
				if(done) {
					return
				}
				count--
				if(template) {
					done = true
					tri.addTemplate(name, template)
					callback(tri.getTemplate(name))
				}
				else if(count == 0) {
					callback(null)
				}
			})
		}
	}
}

t.prototype.parseTemplateScript = function(tx) {
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

/* strip template whitespace */
t.prototype.stw = function(txt) {
	var i = txt.indexOf('\n');
	if(i > -1 && txt.substring(0, i).trim() == '') {
		txt = txt.substring(i + 1);
	}
	i = txt.lastIndexOf('\n');
	if(i > -1 && txt.substring(i).trim() == '') {
		txt = txt.substring(0, i);
	}
	return txt;
};

t.prototype.ActiveElement = function(/* the conditional */cd, data, hd, tripartite) {
	/* assign the conditional expression */
	this.ce = cd;
	/* assign the data selector expression */
	this.dse = data;
	
	this.tripartite = tripartite
	
	/* assign the hd expression */
	if(hd) {
		this.he = hd;
	}
	else {
		this.he = 'defaultTemplate';
	}
	
	/* evaluated data */
	this.ed = null;
};

var ae = t.prototype.ActiveElement;

/* SimpleTemplate */
t.prototype.st = function(/* conditional expression */ cd, data, /* handling expression */ hd, tripartite) {
	this.tripartite = tripartite
	var el = new ae(cd, data, hd, tripartite);
	var f = function(cc) {
		if(arguments.length > 1) {
			el.write.apply(el, arguments)
		}
		else {
			return el.run(cc);
		}
	}
	
	f.write = function(cc, stream, callback) {
		el.write(cc, stream, callback)
	}
	return f
};


ae.prototype.run = function(/* current context */cc) {
	/* run template */
	var rt = false;
	/* evaluated data */
	this.ed = this.edse(cc);
	if(this.ce) {
		rt = this.eic(cc, this.ce);
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
		at = this.eic(cc, at.substring(1));
	}
	if(!at) {
		at = 'defaultTemplate';
	}
	
	if(rt) {
		if(this.ed instanceof Array) {
			var r = '';
			for(var i = 0; i < this.ed.length; i++) {
				r += this.getTemplate(at)(this.ed[i]);
			}
			return r;
		}
		else {
			return this.getTemplate(at)(this.ed);
		}
	}
	return '';
};

ae.prototype.write = function(/* current context */cc, stream, callback) {
	/* run template */
	var rt = false;
	/* evaluated data */
	this.ed = this.edse(cc);
	if(this.ce) {
		rt = this.eic(cc, this.ce);
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
		at = this.eic(cc, at.substring(1));
	}
	if(!at) {
		at = 'defaultTemplate';
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
				template.write(consumed.shift(), stream, function() {
					if(consumed.length > 0) {
						procConsumed()
					}
					else if(callback) {
						callback()
					}
				})
			}
			
			if(consumed.length > 0) {
				procConsumed()
			}
			else {
				callback()
			}
		})
	}
};

ae.prototype.getTemplate = function(name) {
	return this.tripartite.getTemplate(name)
}

/* evaluate data selector expression */
ae.prototype.edse = function(cc) {
	if(!this.dse) {
		return null;
	}
	if(this.dse === '$this') {
		return cc;
	}
	return this.eic(cc, this.dse);
};

/* evaluate in context */
ae.prototype.eic = function(cc, ex) {
	cc = cc || {};
	return this.eicwt.call(cc, cc, ex);
};

/* Evaluate in context having been called so that this === cc (current context */
ae.prototype.eicwt = function(cc, ex) {
	with (cc) {
		try {
			return eval(ex);
		} catch(e) {
			return null;
		}
	}
};

/* parse template */
t.prototype.pt = function(tx) {
	var tks = this.tt(tx);
	var pt = [];
	for(var i = 0; i < tks.length; i++) {
		var tk = tks[i];
		if(tk.active) {
			pt.push(this.tap(tk.content));
		}
		else {
			if(tk.content) {
				pt.push(tk.content);
			}
		}
	}
	
	var t = function(cc) {
		if(arguments.length > 1) {
			t.write.apply(t, arguments)
		}
		else {
			var r = '';
			for(var i = 0; i < pt.length; i++) {
				if(typeof pt[i] === 'string') {
					r += pt[i];
				}
				else {
					r += pt[i](cc);
				}
			}
			return r;
		}
	}
	
	t.write = function(cc, stream, callback) {
		var consumed = cloneArray(pt)
		
		var procConsumed = function() {
			var unit = consumed.shift()
			if(typeof unit === 'string') {
				stream.write(unit)
				if(consumed.length > 0) {
					procConsumed()
				}
				else if(callback) {
					callback()
				}
			}
			else {
				unit.write(cc, stream, function() {
					if(consumed.length > 0) {
						procConsumed()
					}
					else if(callback) {
						callback()
					}
				})
			}
		}
		
		if(consumed.length > 0) {
			procConsumed()
		}
	}
	
	return t
};

/* tokenize active part */
t.prototype.tokenizeActivePart = function(tx) {
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
	return new this.st(con, dat, han, this);
}

t.prototype.tap = t.prototype.tokenizeActivePart

/* tokenize template */
t.prototype.tokenizeTemplate = function(tx) {
	return this.taib(tx, this.constants.templateBoundary);
}

t.prototype.tt = t.prototype.tokenizeTemplate

/** tokenize template script */
t.prototype.tts = function(tx) {
	return this.taib(tx, this.constants.templateNameBoundary);
}

/* tokenize active and inactive blocks */
t.prototype.taib = function(tx, /*Active Region Boundary */ bnd) {
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

var tripartiteInstance = new Tripartite()

if(typeof window != 'undefined') {
	tripartiteInstance.secondaryTemplateFunctionObject = window
}



if(module) {
	module.exports = tripartiteInstance
}
else {
	window.Tripartite = tripartiteInstance
}

