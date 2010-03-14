/*
---
name: dbslayer.js

description: Interface to DBSlayer for Node.JS

author: [Guillermo Rauch](http://devthought.com)
...
*/

var sys = require('sys'),
    http = require('http'),
    
    booleanCommands = ['STAT', 'CLIENT_INFO', 'HOST_INFO', 'SERVER_VERSION', 'CLIENT_VERSION'];

Server = this.Server = function(host, port, timeout){
  this.host = host || 'localhost';
  this.port = port || 9090;
  this.timeout = timeout;
};

Server.prototype.fetch = function(object, key, fn){
  var connection = http.createClient(this.port, this.host),
      request = connection.request('/db?' + escape(JSON.stringify(object)));

  request.addListener('response', function(response){
  	var data = '';
  	
    response.setBodyEncoding("utf8");
  	  
  	response.addListener('data', function(chunk){ 
  	  data += chunk; 
  	});

    response.addListener('end', function(){
      try {
        var object = JSON.parse(data);
      } catch(e){
        fn(e)
      }
      
      if (object.MYSQL_ERROR !== undefined){
      	fn(object);
      } else if (object.ERROR !== undefined){
        fn(object);
      } else {
      	fn(null,key ? object[key] : object);
      }          
    });
  });
  
  request.close();
};

Server.prototype.query = function(query, fn){
  this.fetch({SQL: query}, 'RESULT', fn);
};

for (var i = 0, l = booleanCommands.length; i < l; i++){
  Server.prototype[booleanCommands[i].toLowerCase()] = (function(command){
    return function(fn){
      var obj = {};
      obj[command] = true;
      this.fetch(obj, command, fn);
    };
  })(booleanCommands[i]);
}
