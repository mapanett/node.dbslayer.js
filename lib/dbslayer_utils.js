// Some utility functions for dbslayer

function addSlashes (str) {
	// Backslash-escape single quotes, double quotes and backslash. 
	// Morph 0x00 into \0.
	return str.replace(/(['"\\])/g,'\\$1').replace(/\x00/g, '\\0');
}

function sqlStr (x) {
	switch (typeof x) {
		case 'string':
			return "'"+addSlashes(x)+"'";
		case 'number':
			return x.toString();
		case 'object':
			if (x === null) {
				return 'NULL';
			} else if (x.constructor === Date) {
				return "'"
					+x.getFullYear()
					+'-'
					+(x.getMonth()+1)
					+'-'
					+x.getDate()
					+' '
					+x.getHours()
					+':'
					+x.getMinutes()
					+':'
					+x.getSeconds()
					+"'"
			} else {
				throw Error('sqlstr: unsupported type "object"');
			}
		case 'boolean':
			return x === true ? '1' : '0';
			break;
		default:
			throw Error('sqlstr: unknown type: '+typeof x);
	}
}

exports.addSlashes = addSlashes;
exports.sqlStr     = sqlStr;
// vim: set noet
