var pg = require('pg');
var connectionString = "postgres://ankit:accantus@localhost:5432/grepman_containerdb";
var client = new pg.Client(connectionString);
client.connect();

var results = [];

    // Grab data from http request
    // var data = {text: req.body.text, complete: false};

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          // done();
          console.log(err);
          // return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        var insert = client.query("INSERT INTO cached_containers(sha_key, container_location) values($1, $2)", ['ankit', 'kumar']);
        insert.on('end',function(d) {
            
            console.log(d);
        })

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM cached_containers ");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            
            console.log(results);
        });


    });