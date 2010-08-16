var helper = require('sql_helper');

exports.testGenerateSelectSimple = function(test) {
	test.equals('select * from test',
					helper.generateSelect("*", "test"),
					"Basic select");
	test.done();	
};

exports.testGenerateSelectPlaceHolder = function(test) {
	test.equals('select * from test where blah = \'blah\'',
					helper.generateSelect("*", "test", "blah = ?", ['blah']),
					"Replace place holder");
	
	//test.ok('select * from test where blah = \'blah?\'' == 
	//				helper.generateSelect("*", "test", "blah = ?", ['blah?']),
	//			"Replace place holder");
	test.done();	
};

exports.testGenerateInsert = function(test) {
	test.equals('insert into test (col1, col2) values (\'val1\', \'val2\')',
			  		helper.generateInsert('test', { col1: 'val1', col2: 'val2'}),
					"Generates an insert");

	test.done();	
};

exports.testGenerateUpdate = function(test) {
	test.equals('update test set col1 = \'val1\' where col2 = \'val2\'',
			helper.generateUpdate('test', { col1: 'val1'}, 'col2 = ?', ['val2']),
			"Generates an update");

	test.done();	
}
