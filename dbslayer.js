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
		callback = args[args.length-1];
	
	if (opt.select) {
		var placeholderArgs = Array.prototype.slice.call(args, 1, -1);
		this.executeSelect(opt.select, opt.from, opt.where, placeholderArgs, callback);
	} else if (opt.insert) {
		// TODO
	} else if (opt.update) {
		// TODO
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
			condition = condition.replace(/\?/, "'" + addslashes(placeholderArgs.shift()) + "'");
		}
		generatedQuery += ' where ' + condition;
	}
	
	generatedQuery += ';';
	
	this.fetch(generatedQuery, callback);
	//sys.log('^^generatedQuery: '+generatedQuery);
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
