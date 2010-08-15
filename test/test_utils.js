var utils = require('dbslayer_utils');

// Should return the string with quotes
exports.testSqlStrWithString = function(test) {
	test.expect(2);
	test.ok("'test'" == utils.sqlStr("test"), "Adds quotes");
   test.ok("'\\'test\\''" == utils.sqlStr("'test'"), "Adds slashes");
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
	test.ok("'2010-10-8 7:6:5'" === utils.sqlStr(new Date(2010, 9, 8, 7, 6, 5)), 
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
	test.ok("\\'\\0\\'" == utils.addSlashes("'\0'"));
	test.ok("\\\"\\\\\\\"" == utils.addSlashes("\"\\\""));
	test.done();
};
		
// vim: set noet
