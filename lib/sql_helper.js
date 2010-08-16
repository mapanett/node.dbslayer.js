var utils = require("./dbslayer_utils");

function generateSelect(columns, tables, condition, placeholderArgs) {
	var generatedQuery = '';
	generatedQuery = 'select ' + columns + ' from ' + tables;
	
	if (condition) {
		generatedQuery += ' where ' + 
			utils.replacePlaceholders(condition, placeholderArgs);
	}
	
	return generatedQuery;

};

function generateInsert(insert_into, values) {
	var generatedQuery = '', columnNames = [], rowValues = [];
	
	for (var columnName in values) {
		if (values.hasOwnProperty(columnName)) {
			columnNames.push(columnName);
			rowValues.push(utils.sqlStr(values[columnName]));
		}
	}
	
	generatedQuery
		+= 'insert into '
		+ insert_into
		+ ' ('
		+ columnNames.join(', ')
		+ ') values ('
		+ rowValues.join(', ')
		+ ')';

	return generatedQuery;
};

function generateUpdate(update_table, values, condition, placeholderArgs) {
	var generatedQuery = this.db ? 'use ' + this.db + ';' : '',
		 setFragments = [],
		 conditionFragment = '';
	
	for (var columnName in values) {
		if (values.hasOwnProperty(columnName)) {
			setFragments.push(columnName + ' = ' + utils.sqlStr(values[columnName]));
		}
	}
	
	if (condition) {
		// FIXME this will fail when a placeholderArg contains a question mark.
		while (condition.indexOf('?') !== -1) {
			condition = condition.replace(/\?/, utils.sqlStr(placeholderArgs.shift()));
		}
		conditionFragment = ' where ' + condition;
	}
	
	generatedQuery
		+= 'update ' + update_table
		+ ' set '
		+ setFragments.join(', ')
		+ conditionFragment;
	
	//sys.log('^^update generatedQuery: '+generatedQuery);
	return generatedQuery;
};


exports.generateSelect = generateSelect;
exports.generateInsert = generateInsert;
exports.generateUpdate = generateUpdate;
