var dbslayer = require('dbslayer');

exports.testDBSlayerSelect = function(test) {
	var c = dbslayer.connect({db: 'dbslayer_test'});
	test.expect(1);

	c({ select: '*', from:  'select_test' },
		function(rows) { 
	  		test.ok(rows.length > 0, "Returned something from db");
			test.done();
	  	});

};
