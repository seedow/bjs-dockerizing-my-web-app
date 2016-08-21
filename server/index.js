var config = require('./config.js'),
  WebSocketServer = require('ws').Server,
  redis = require('redis');

var wss = new WebSocketServer({
  port: config.wsPort
})

var client = redis.createClient(config.redisPort, config.redisUrl);

var isConnected = false;


function initDB() {
  client.exists('usersConnected', function(err, reply) {
    if (reply !== 1) {
      client.set("hits", 0);
      console.log('Db initialized');
    } else {
      console.log('Db already exists');
    }
  })
}

client.on('connect', function() {
  console.log('Connection with redis server established');
  isConnected = true;
  initDB();
})

client.on('reconnecting', function() {
  console.log('Reconnecting')
})

client.on('error', function() {

})

client.on('end', function() {
  console.log("Could not contact the redis server");
})

client.monitor(function() {});
client.on('monitor', function() {
  console.log(arguments[1])
})

function hit(userConnected) {
  client.decr("hits", sendUpdate);

}

wss.on('connection', function connection(ws) {
  ws.on('message', function() {
    hit();
  })
});


var sendUpdate = function(err, connections) {
  wss.clients.forEach(function(client) {
    client.send(connections.toString())
  })
}
