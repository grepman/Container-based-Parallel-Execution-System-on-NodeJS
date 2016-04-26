var Sequelize = require('sequelize')
var sequelize = new Sequelize('grepman_containerdb', 'postgres', 'accantus', {
  host: 'localhost',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
})

// console.log(sequelize)
var Container = sequelize.define('cached_containers', {
  shaKey: {
    type: Sequelize.STRING,
    field: 'sha_key' // Will result in an attribute that is firstName when user facing but first_name in the database
  },
  containerLocation: {
    type: Sequelize.STRING,
    field: 'container_location'
  }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

// Container.sync({force: true}).then(function () {
//   // Table created
//   return Container.create({
//     shaKey: 'google',
//     containerLocation: 'Hancock'
//   });
// });

var created = Container.create({
    shaKey: 'google',
    containerLocation: 'Hancock'
  });

created.then(Container.findAll({
  attributes: [[sequelize.fn('COUNT', sequelize.col('container_location')), 'no_hats']]
}).then(function(data){
	console.log(data)
}))


Container.findAll({
  attributes: [[sequelize.fn('COUNT', sequelize.col('container_location')), 'no_hats']]
}).then(function(data){
	console.log(data)
});