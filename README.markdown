# node.dbslayer.js

Is my (@rentzsch's) accidental rewrite of Guillermo Rauch's project. It does the same thing, but now in a higher-level (hashes => SQL) & safer (poor man's SQL placeholders) way.

## WARNING: Not Done

I still need to add support for verbs like `delete`. Pull requests welcome if you beat me to the punch.

## Basic Usage Example

	var	sys = require('sys'),
		http = require('http'),
		path = require('path'),
		dbslayer = require('./node.dbslayer.js/dbslayer'),
		base64 = require('./cookie-node/base64');
	
	http.createServer(function (req, res) {
		var encodedAuthorization = req.headers.authorization;
		if (encodedAuthorization) {
			encodedAuthorization = encodedAuthorization.replace(/^Basic /,'');
			var decodedAuthorization = base64.decode(encodedAuthorization),
				userpass = decodedAuthorization.split(':'),
				user = userpass[0],
				pass = userpass[1];
			
			var exampleDB = dbslayer.connect({db:'db_example'});
			exampleDB({
				select:'c_kind',
				from:'t_login',
				where:'c_email = ? and c_password = ?'},
				user,
				pass,
				function(rows){
					if (rows.length === 1) {
						res.writeJSON({kind:rows[0].c_kind});
					} else {
						res.write401Unauthorized();
					}
				}
			);
		} else {
			res.write401Unauthorized();
		}
	}).listen(8080);
	
	sys.puts('Server running at http://127.0.0.1:8080/');
		
	http.ServerResponse.prototype.write401Unauthorized = function(){
		this.writeHead(401, {
			'Content-Type': 'text/plain',
			'WWW-Authenticate': 'Basic realm="'+path.basename(__filename)+'"'
		});
		this.write('401 Unauthorized');
		this.end();
	};
		
	http.ServerResponse.prototype.writeJSON = function(object){
		this.writeHead(200, {'Content-Type': 'application/json'});
		this.write(JSON.stringify(object));
		this.end();
	};