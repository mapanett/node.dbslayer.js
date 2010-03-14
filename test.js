/*
---
name: tools.js

description: <
  This is a demonstration of how dbslayer.js can be used.
  It takes three parameters from the SQL query, a host

author: [Guillermo Rauch](http://devthought.com)
...
*/

var sys = require('sys'),
    dbslayer = require('./dbslayer'),    
    sql = process.ARGV[2],
    db_name = process.ARGV[3],
    db = new dbslayer.Server();
    
if (!sql){
  sys.puts('Please provide the SQL query');
  return;
}

if (!db_name){
  sys.puts('Please provide a database Name');
  return;
}

function pp_error(error,ctx){
  sys.puts('MySQL ' + ctx + ' error (' + (error.MYSQL_ERRNO || '') + '): ' + error.MYSQL_ERROR);			 
}

db.query('USE ' + db_name, function(error, result){
  sys.puts('-------------------------');
  if( error ) { pp_error(error,'database select'); return; }
  sys.puts('using ' + db_name);

  db.query(sql, function(error, result){
	sys.puts('-------------------------');
	if( error ) { pp_error(error,'query'); return; }
	for (var i = 0, l = result.ROWS.length; i < l; i++){
	  sys.puts('Row ' + i + ': ' + result.ROWS[i].join(' '));
	}
  });  
});
   
['stat', 'client_info', 'host_info', 'server_version', 'client_version'].forEach(function(command){  
  db[command](function(error,result){
    sys.puts('-------------------------');
    sys.puts(command.toUpperCase() + ' ' + result);
  });
});

