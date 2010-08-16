//  dbslayer.js 1.0d2
//      Copyright (c) 2010 Jonathan 'Wolf' Rentzsch: <http://rentzsch.com>
//      Some rights reserved: <http://opensource.org/licenses/mit-license.php>
//      
//  Interface to DBSlayer for node.js.
//  Original codebase by [Guillermo Rauch](http://devthought.com)

var sys = require('sys'),
	http = require('http'),
	utils = require('./lib/dbslayer_utils');
	helper = require('./lib/sql_helper');

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
		placeholderArgs,
		query = [];

	if ( this.db ) {
		query.push('use ' + this.db);
	}
	
	if (opt.select) {
		placeholderArgs = Array.prototype.slice.call(args, 1, -1);
		query.push(helper.generateSelect(opt.select, opt.from, 
													opt.where, placeholderArgs));
		
	} else if (opt.insert_into) {
		query.push(helper.generateInsert(opt.insert_into, opt.values));

	} else if (opt.update) {
		placeholderArgs = Array.prototype.slice.call(args, 1, -1);
		query.push(helper.generateUpdate(opt.update, opt.values, 
													opt.where, placeholderArgs));
	} else if (opt['delete']) {
		// TODO
		throw Error('dbslayer.js: delete not implemented');
	} else {
		throw Error('dbslayer.js: unknown verb (' + JSON.stringify(opt) + ')');
	}
		
	this.fetch(query.join(";"), callback);
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

   
// vim: set noet
