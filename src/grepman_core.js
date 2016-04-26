var core = {}
    core.util = require('./grepman_core_util.js')


core.log = function(log){
	console.log(log)
}

core.performAction = function(action){

	_returnObj = function(action){
		switch(action){
			case 'compute':
			return {
				"_with": function(argv){
					
					//we will do these required actions
					//-------------------------------
					//1.create a container
					//2.copy the input files
					//3.read the config.json file
					//4.execute
					//5.save the output to the specified file
					//6.schedule a cron job
					
					 core.util.promise.make('createContainer-->Term-run-->SaveToOutputContainer', function(resolve, reject){	

					 	var copyto_containerName = core.util.createContainer(core.util.globals.getAppDir()+'/containers/')
					 	core.util.copyInputFiles(copyto_containerName, 1000, resolve)

					 })
					 .then(
					 	function(executionLogData){
					 		
					 		//use config definations in globals 
					 		core.util.globals.userConfig = executionLogData.dataJSON
					 		
					 		return executionLogData
					 	}
					 )
					 .then(
					 	function(executionLogData){
					 		//Build
					 		
					 		
					 			new Promise (function(resolve, reject){
						 			core.util.spawnProcess('node',[executionLogData.location.folderPath+'/'+executionLogData.dataJSON.inputFile[0]])

						 			._onData(function(output){
							 			console.log("<*> The output from file is : ", output.toString());
							 			executionLogData.returnedOutput = output
							 			resolve(executionLogData)
						 			})
						 		})
					 		
						 		.then(function(executionLogData){
						 			//so the generatedOutput was executionLogData.returnedOutput
						 			//write this output to ./output/containerName/output.txt
						 			new Promise (function(resolve, reject){
						 			var outputContainerName = 
						 			core.util.createOutputContainer(core.util.globals.getAppDir()+'/output/'+executionLogData.location.folderName)

						 			var locationToWriteOutput = core.util.globals.getAppDir()+'/output/'+executionLogData.location.folderName+'/output.txt'
						 			var isFileWritten =
						 			core.util.writeFile(locationToWriteOutput, executionLogData.returnedOutput)	
						 			resolve(locationToWriteOutput)

						 			})
						 			.then(
						 				function(locationSaved){
							 				core.util.storeOPContainerLocInDB(executionLogData,locationSaved)		
							 			}
						 			)		 			

						 		})

						 	return executionLogData
					 	}
					 )
					 .then(
					 	function(executionLogData){
					 		//schedule a cronJob
					 		// console.log('-------+++++', executionLogData, argv)
					 	}
					 )

					// core.util.generateOutputFromContainer()
					// core.util.save(generatedOutput)
					// core.util.scheduleCron()

				}
			}
			break

		}
	}

	
	return _returnObj(action)
}

module.exports = core;