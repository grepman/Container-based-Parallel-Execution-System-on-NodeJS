
// utils.spawnProcess('node',['--version'])._onData(function(data){console.log(data.toString());})


// utils.executeParallely_withControl(4, masterScope, [], workerScope, []);




var masterScope = function() { 
    
    var numCPUs = require('os').cpus().length;
    var data = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    var currentDataPos = 0;
    console.log(numCPUs+' CPUs detected');

    var statusInterval = setInterval(function(){
        console.log('Remaing:',data.length-currentDataPos);

        if(allWorkersDead()) {
            clearInterval(statusInterval);
        }
    },500);
    
    var allDataProcessed = function() {
        return currentDataPos === data.length;
    };
    
    var allWorkersDead = function() {
        return Object.keys(cluster.workers).length === 0;
    };

    var sendWork = function(worker) {
        worker.send(data[currentDataPos++]);
    };
    
    var messageHandler = function(msg){
        if(msg === 'complete') {
            if(allDataProcessed()) {
                this.send('shutdown');
            } else {
                sendWork(this);
            }
        }
    };
    
    cluster.on('online',sendWork);

    for(var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    Object.keys(cluster.workers).forEach(function(id) {
        cluster.workers[id].on('message', messageHandler);
    });
    
    process.on('exit',function(){
        console.log('ALL DONE');
    });
}

var workerScope = function(){

    process.on('message',function(cmd){
        if(cmd === 'shutdown') {
            process.exit();
            return;
        }

        // Randomize a delay to simulate workload
        setTimeout(function(){
            console.log('Worker '+cluster.worker.id+' processing data: "'+cmd+'"');
            process.send('complete');
        },parseInt(Math.random()*5000));
        
    });
}