 var express = require("express");
 var app = express();

 // serves main page 
 app.get("/:sha_key", function(req, res) {
    

    var pg = require('pg');
    var connectionString = require('./db/db_config.json')['pg_sql'];
    var client = new pg.Client(connectionString);
    client.connect();

    var results = [];

    pg.connect(connectionString, function(err, client, done) {
      if(err) {
        console.log(err)
        return 0
      }

      var query = client.query("SELECT * FROM cached_containers where sha_key=$1", [req.params.sha_key]);
        query.on('row', function(row) {
            results.push(row);
        });
        query.on('end', function() {
            // res.json(results);
            return res.sendFile(results[0]['container_location'])
        });          
    })
  
 });

 
 var port = process.env.PORT || 5000;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });