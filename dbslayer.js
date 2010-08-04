//  dbslayer.js 1.0d1
//      Copyright (c) 2010 Jonathan 'Wolf' Rentzsch: <http://rentzsch.com>
//      Some rights reserved: <http://opensource.org/licenses/mit-license.php>
//      
//  Interface to DBSlayer for node.js.
//	Original codebase by [Guillermo Rauch](http://devthought.com)

var sys = require('sys'),
	http = require('http');

function DBSlayerConnection(opts) {
	this.host = opts['host'] || 'localhost';
	this.port = opts['port'] || 9090;
	this.db = opts['db'];
	this.timeout = opts['timeout'];
	
	this.fetch(
		'SET character_set_results = utf8;'
		+'SET character_set_client = utf8;'
		+'SET character_set_connection = utf8;',
		function(){});
}

DBSlayerConnection.prototype.executeQuery = function(args) {
	var opt = args[0],
		callback = args[args.length-1],
		placeholderArgs;
	
	if (opt.select) {
		placeholderArgs = Array.prototype.slice.call(args, 1, -1);
		this.executeSelect(opt.select, opt.from, opt.where, placeholderArgs, callback);
	} else if (opt.insert_into) {
		this.executeInsert(opt.insert_into, opt.values, callback);
	} else if (opt.update) {
      this.executeUpdate(opt.update, opt.values, opt.where, callback); 
	} else if (opt['delete']) {
		// TODO
	} else {
		sys.log('dbslayer.js: unknown verb (' + JSON.stringify(opt) + ')');
	}
}

DBSlayerConnection.prototype.executeSelect = function(columns, tables, condition, placeholderArgs, callback) {
	var generatedQuery = this.db ? 'use ' + this.db + ';' : '';
	
	generatedQuery += 'select ' + columns + ' from ' + tables;
	
	if (condition) {
		// FIXME this will fail when a placeholderArg contains a question mark.
		while (condition.indexOf('?') !== -1) {
			condition = condition.replace(/\?/, sqlstr(placeholderArgs.shift()));
		}
		generatedQuery += ' where ' + condition;
	}
	
	generatedQuery += ';';
	
	this.fetch(generatedQuery, callback);
	//sys.log('^^generatedQuery: '+generatedQuery);
}

DBSlayerConnection.prototype.executeInsert = function(insert_into, values, callback) {
	var generatedQuery = this.db ? 'use ' + this.db + ';' : '',
		columnNames = [],
		rowValues = [];
	
	for (var columnName in values) {
		if (values.hasOwnProperty(columnName)) {
			columnNames.push(columnName);
			rowValues.push(sqlstr(values[columnName]));
		}
	}
	
	generatedQuery
		+= 'insert into '
		+ insert_into
		+ ' ('
		+ columnNames.join(', ')
		+ ') values ('
		+ rowValues.join(', ')
		+ ');';
	
	//sys.log('^^generatedQuery: '+generatedQuery);
	this.fetch(generatedQuery, typeof callback === 'function' ? callback : function(){});
}

DBSlayerConnection.prototype.executeUpdate = function(update_table, 
                                                      values, 
                                                      condition,
                                                      callback) {
	var generatedQuery = this.db ? 'use ' + this.db + ';' : '',
		 setFragments = [],
       conditionFragment = "";
	
	for (var columnName in values) {
		if (values.hasOwnProperty(columnName)) {
         setFragments.push(columnName + ' = ' + sqlstr(values[columnName]));
		}
	}

   if ( condition ) {
      conditionFragment = "where " + condition;
   }
	
	generatedQuery
		+= 'update ' + update_table 
         + ' set ' 
         + setFragments.join(', ')
         + conditionFragment + ";";
	
	sys.log('^^update generatedQuery: '+generatedQuery);
	this.fetch(generatedQuery, 
              typeof callback === 'function' ? callback : function(){});
}

function addslashes(str) {
	// Backslash-escape single quotes, double quotes and backslash. Morph 0x00 into \0.
	return str.replace(/(['"\\])/g,'\\$1').replace(/\x00/g, '\\0');
}

DBSlayerConnection.prototype.fetch = function(queryString, callback) {
	var queryRecord = {SQL:queryString},
		queryJSON = JSON.stringify(queryRecord),
		escapedQueryJSON = escape(queryJSON.replace(/ /g,"+")),
		connection = http.createClient(this.port, this.host),
		request = connection.request('/db?' + escapedQueryJSON),
		dbconnection = this;
	
	connection.addListener('error', function(connectionException){
		if (connectionException.errno === process.ECONNREFUSED) {
			sys.log('ECONNREFUSED: dbslayer connection refused to '
				+connection.host
				+':'
				+connection.port);
		}
		callback(undefined, connectionException);
	});
	
	request.addListener('response', function(response){
		var data = '';
		
		response.setEncoding("utf8");
		
		response.addListener('data', function(chunk){ 
			data += chunk; 
		});
		
		response.addListener('end', function(){
			try {
				var object = JSON.parse(data);
			} catch(e){
				callback(undefined, e)
			}
			
			if (object.MYSQL_ERROR !== undefined){
				callback(undefined, object);
			} else if (object.ERROR !== undefined){
				callback(undefined, object);
			} else {
				//sys.log('^^data: '+data);
				dbconnection.callBackWithResults(
					callback,
					object.RESULT[1].HEADER,
					object.RESULT[1].ROWS
				);
			}          
		});
	});
	
	request.end();
}

DBSlayerConnection.prototype.callBackWithResults = function(callback, headers, rows) {
	var resultRows = [];
	
	if (rows !== undefined) {
		rows.forEach(function(rowArray){
			var resultRow = {};
			headers.forEach(function(headerName, columnIndex){
				resultRow[headerName] = rowArray[columnIndex];
			});
			resultRows.push(resultRow);
		});
	}
	callback(resultRows);
}

exports.connect = function(opts) {
	var connection = new DBSlayerConnection(opts),
		result = function(){connection.executeQuery(arguments);};
	
	return result;
}
exports.DBSlayerConnection = DBSlayerConnection;

function sqlstr(x) {
	switch (typeof x) {
		case 'string':
			return "'"+addslashes(x)+"'";
		case 'number':
			return x.toString();
		case 'object':
			if (x.constructor === Date) {
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
		default:
			throw Error('sqlstr: unknown type: '+typeof x);
	}
}
