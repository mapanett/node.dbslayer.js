var dbslayer = require('dbslayer');

exports.testDBSlayerSelect = function(test) {
	var c = dbslayer.connect({db: 'dbslayer_test'});
	test.expect(2);

	c({ select: '*', from:  'select_test' },
		function(rows) { 
	  		test.ok(rows.length > 0, "Returned something from db");
			test.equals(rows[0].id, '1', "Returned expected value");
			test.done();
	  	});

};

exports.testDBSlayerInsert = function(test) {
	var c = dbslayer.connect({db: 'dbslayer_test'}),
		 d = new Date() + "";

	test.expect(2);

	c({ insert_into: 'insert_test', values: { col1: d}},
		function() {
			c({select: 'col1', from: 'insert_test', where: 'col1 = ?'},
				d,
				function(rows) {
					test.equals(1, rows.length, "returned something");
					test.equals(d, rows[0].col1, "returned the right thing");

					test.done();
				});
		});
};

exports.testDBSlayerUpdate = function(test) {
	var c = dbslayer.connect({db: 'dbslayer_test'}),
		 d = new Date() + "";

	test.expect(2);

	c({ update: 'insert_test', values: { col1: d}, where: 'id = ?'}, 1, 
		function() {
			c({select: 'col1', from: 'insert_test', where: 'id = ?'}, 1,
				function(rows) {
					test.equals(1, rows.length, "returned something");
					test.equals(d, rows[0].col1, "returned the right thing");

					test.done();
				});
		});
};


exports.testDBSlayerDelete = function(test) {
	var c = dbslayer.connect({db: 'dbslayer_test'});
	test.expect(1);
	try {
		c({'delete': 'test', where: 'id = ?'}, 1, function() {});
	} catch (e) {
		test.ok(("" + e).match(/not implemented/), "yep not done yet...");
	}
	test.done();
};

exports.testDBSlayerUnknown = function(test) {
	var c = dbslayer.connect({db: 'dbslayer_test'});
	test.expect(1);
	try {
		c({'unk unk': 'test', where: 'id = ?'}, 1, function() {});
	} catch (e) {
		test.ok(("" + e).match(/unknown verb/), "just what we wanted");
	}
	test.done();
};

