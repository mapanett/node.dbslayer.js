#!/usr/bin/env node

var sys = require('sys');

require.paths.push(__dirname);
require.paths.push(__dirname + '/deps');
require.paths.push(__dirname + '/lib');
var testrunner = require('nodeunit').testrunner;

process.chdir(__dirname);
testrunner.run(['test']);

