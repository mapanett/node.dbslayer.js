node.dbslayer.js
=================

node.dbslayer.js is a very basic and easy-to-use library to connect to a DBSlayer server, which effectively provides non-blocking and scalable MySQL support for Node.JS. 

DBSlayer benefits include:

* It's Node.JS/V8/JavaScript friendly, since the the messages are delivered in JSON format over HTTP.

* Developed by the New York Times, it's designed with scalability in mind, doing connection pooling for you. This is what makes DBSlayer arguably better than implementing an async MySQL client directly into Node (through mysac for example).

Requirements
------------

* [Node.js](http://nodejs.org/) (tested with v0.1.32)
* [DBSlayer](http://code.nytimes.com/projects/dbslayer/) (tested with beta-12)

How to Use
----------
	
From your node.js script, require the `dbslayer` package

	var db = require('dbslayer');

Initialize a connection

	var connection = db.Server('localhost', 9090);
	
and then perform a query:

	connection.query("use mysql;select name from help_topic;", function(error, result){
		if (error) { 
			res.write('mysql error: ' + error);
		} else {
			var rows = result[1].ROWS;
			rows.forEach(function(row){
				res.write(row[0]+'\n');
			});
		}
		res.close();
	});
	
The last argument to the query function is a callback. The query result or an error, if one occcurred, is returned in the parameters to the provided function.

Aside from query, the commands `stat`, `client_info`, `host_info`, `server_version` and `client_version` are available, which provide the respective information about the server.

Installing DBSlayer
-------------------

Compile it according to the instructions [here](http://code.nytimes.com/projects/dbslayer/wiki).

Then create a /etc/dbslayer.conf file defining a database. Here I'm defining the `cool` server which connects to my `mysql` database

	[cool]
	database=mysql
	host=localhost
	user=root
	pass=1234
	
Then run DBSlayer for that connection:

	dbslayer -c /etc/dbslayer.conf -s cool
	
Test it by running test.js like this:

	node test.js "SELECT * FROM help_category"
	
If you get a bunch of entries like in this [screenshot](http://cld.ly/9aosh) then dbslayer (and node.dbslayer.js) work!

Author
------

Guillermo Rauch <[http://devthought.com](http://devthought.com)>
