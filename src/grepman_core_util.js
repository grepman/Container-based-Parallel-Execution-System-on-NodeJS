var child = require('child_process')
var cluster = require('cluster')
var path = require('path');
var utils = {}
utils.globals = {}
utils.globals.connection = require('../db/db_config.json')
utils.globals.getAppDir = function(){

	var appDir = path.dirname(require.main.filename);
	return appDir
}

utils.spawnProcess = function(process, argvArr){
	this.worker = child.spawn(process, argvArr)

	this._onData = function(callback) {
		this.worker.stdout.on('data', callback)
	}
	this._onError = function(callback) {
		this.worker.stderr.on('data', callback)
	}
	this._onClose = function(callback) { 
		this.worker.on('close', callback)
	}

	return this
}

utils.execProcess = function(command, callback){
	require('child_process').exec(command, callback)
}

utils.executeParallely_withControl = function(numCPUs, masterScopeCallback, masterScopeArgvArr, workerScopeCallback, workerScopeArgvArr){

	if (cluster.isMaster) {

		for (var i = 0; i < numCPUs; i++) {
	        cluster.fork();
	    }

		this.allWorkersDead = function() {
			return Object.keys(cluster.workers).length === 0;
		}

		process.on('exit',function(){
	        console.log('ALL DONE');
	    })

		masterScopeCallback.apply(this, masterScopeArgvArr)

	}
	else if(cluster.isWorker){
		workerScopeCallback.apply(this, workerScopeArgvArr)
	}
}

utils.createContainer = function(location) {
	//1. check create a folder with currentTimestamp
	forceCreate = true
	var _timestamp = new Date().toString().replace(/ /g, '')
	var folderPath = utils.createFolder(location + _timestamp, forceCreate)
	var folderName = _timestamp
	return {"folderPath":folderPath, "folderName":folderName}
}

utils.createFolder = function(folderName, forceCreate) {
	var dir = folderName
	var fs = require('fs')
	if (forceCreate){
		//forcefully create the folder
		fs.mkdirSync(dir);
	}
	else{
		//check for the existing folder
		if (!fs.existsSync(dir)){
			    fs.mkdirSync(dir);
			}
	}
	return folderName
}

utils.copyInputFiles = function(location, limit, resolve){
	// console.log(location);
	var ncp = require('ncp').ncp
	ncp.limit = limit
	ncp(utils.globals.getAppDir()+'/input/', location.folderPath, function (err) {
	 if (err) {
	   return console.error(err);
	 }
	 else{
	 	fs = require('fs')
		fs.readFile(location.folderPath+'/config.json', 'utf8', function (err,data) {
		  if (err) {
		    return console.log(err);
		  }
		  return resolve({"location":location, "dataJSON": require(location.folderPath+'/config.json')})
		});
	 }
	});
}

utils.readFile_toString = function(location){
	fs = require('fs')
	fs.readFile(location, 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  return data;
	});
}

utils.writeFile = function(location, data){
	fs = require('fs')
	fs.writeFile(location, data, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log('<*> The output saved at : ', location, '\n')
	}); 
}

utils.promise = (function(){
    //declaration of generalized promise
    var promiseInstance = {};
    var _promise = function(instanceName, instanceFunction){
      promiseInstance[instanceName]= new Promise(function(resolve, reject) {
        instanceFunction(resolve, reject);
      });
      return promiseInstance[instanceName];
    };

    return {
      "make": _promise,
      "instances": promiseInstance
    };

})();

utils.createOutputContainer = function(outputContainerName){
	utils.createFolder(outputContainerName, true)
	return outputContainerName
}

utils.storeOPContainerLocInDB = function(executionLogData, locationSaved){
	var sha_encrypt = require('sha1');
 
	var encrypted_sha_key = sha_encrypt(executionLogData.location.folderName);
	console.log('\n<*> Your API URL is    http://localhost:5000/'+encrypted_sha_key+'\n')

	utils.insertIntoPostgres(['INSERT INTO cached_containers(sha_key, container_location) values($1, $2)', [encrypted_sha_key, locationSaved]])

}

utils.insertIntoPostgres = function(query){
	var pg = require('pg');
	var connectionString = utils.globals.connection['pg_sql'];
	var client = new pg.Client(connectionString);
	client.connect();

	pg.connect(connectionString, function(err, client, done) {
		if(err) {
			console.log(err)
			return 0
		}
		var insert = client.query(query[0], query[1]);
        insert.on('end',function(d) {
            // console.log(d)
            process.exit()
        })
        return 1
	})

}

// utils.spawnProcess('node',['--version'])._onData(function(data){console.log(data.toString());})

module.exports = utils