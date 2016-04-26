#! /usr/bin/env node

var _core = require('./src/grepman_core.js')

_core.log('--- Welcome to grepman ---\n');

var _programDescription =  'Now execute your programs in a parallel computation based container \nSave to an Out Dir - Get the output as API\n '

_core.log(_programDescription)

//for the action argument
_core.performAction(process.argv[2])._with(process.argv)


// _core.log(process.argv);