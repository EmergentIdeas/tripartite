/*
function resolveDataPath(data, path) {
	if(data === null || data === undefined) {
		return data
	}
	let parts
	if(typeof path === 'string') {
		parts = path.trim().split('.')
	}
	else if(Array.isArray(path)) {
		parts = path
	}
	
	let name = parts.shift()
	if(name.indexOf(' ') > -1) {
		// there's a space, which means it's really unlikely it's a property
		return null
	}
	let child
	if(name === 'this' || name === '$this') {
		child = data
	}
	else if(typeof data === 'object') {
		if(name in data) {
			child = data[name]
		}
	}
	if(parts.length > 0) {
		return resolveDataPath(child, parts)
	}
	else {
		return child
	}
} */
function resolveDataPath(data, path) {
	try {
		if (data === null || data === undefined) {
			return data
		}
		let parts
		if (typeof path === 'string') {
			parts = path.trim().split('.')
		}
		else if (Array.isArray(path)) {
			parts = path
		}

		while (parts.length > 0) {
			let name = parts.shift()
			if (name.indexOf(' ') > -1) {
				// there's a space, which means it's really unlikely it's a property
				return null
			}
			let child
			if (name === 'this' || name === '$this') {
				child = data
			}
			else if (typeof data === 'object') {
				if (name in data) {
					child = data[name]
				}
			}
			if (parts.length == 0) {
				return child
			}
			if (child === null || child === undefined) {
				return null
			}
			data = child
		}
	}
	catch (e) {
		return null
	}
}

module.exports = resolveDataPath