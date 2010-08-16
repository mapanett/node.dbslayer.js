var utils = require('dbslayer_utils');

// Should return the string with quotes
exports.testSqlStrWithString = function(test) {
	test.expect(2);
	test.equals("'test'", utils.sqlStr("test"), "Adds quotes");
   test.equals("'\\'test\\''", utils.sqlStr("'test'"), "Adds slashes");
	test.done();
};

exports.testSqlStrWithNumbers = function(test) {
	test.ok("2" === utils.sqlStr(2), "Numbers to strings.");
	test.done();
};

exports.testSqlStrWithNULL = function(test) {
	test.ok("NULL" === utils.sqlStr(null), "null => NULL.");
	test.done();
};

exports.testSqlStrWithDates = function(test) {
	// MySQL accepts format without zero padding.
	test.equals("'2010-10-8 7:6:5'", utils.sqlStr(new Date(2010, 9, 8, 7, 6, 5)), 
			  		"Converts date to string");
	test.done();
};

exports.testSqlStrWithBoolean = function(test) {
	test.ok("0" === utils.sqlStr(false), "false => 0");
	test.ok("1" === utils.sqlStr(true), "true => 1");
	test.done();
};

exports.testSqlStrWithObject = function(test) {
	test.expect(1);
	try {
		utils.sqlStr({unknow: "object"});
	} catch(e) {
		test.ok('Error: sqlstr: unsupported type "object"' == e.toString());
	}
	test.done();
};

exports.testAddSlashes = function(test) {
	test.expect(2);
	test.equals("\\'\\0\\'", utils.addSlashes("'\0'"));
	test.equals("\\\"\\\\\\\"", utils.addSlashes("\"\\\""));
	test.done();
};


exports.testReplacePlaceHolders = function(test) {
	test.equals("col1 = 'val1'", 
					utils.replacePlaceholders("col1 = ?", ["val1"]),
					"replaces one place holder");
	
	test.equals("col1 = 'val1', col2 = '?????'", 
					utils.replacePlaceholders("col1 = ?, col2 = ?", 
														["val1", "?????"]),
					"replaces one place holder");

	test.done();

};



// vim: set noet
