var config = require('./config.js'),
  WebSocketServer = require('ws').Server,
  redis = require('redis');

var wss = new WebSocketServer({
  port: config.wsPort
})

var redis = redis.createClient(config.redisPort, config.redisUrl);


function initDB() {
  redis.exists('hits', function(err, reply) {
    if (reply !== 1) {
      redis.set("hits", 0);
      console.log('Db initialized');
    } else {
      console.log('Db already exists');
    }
  })
}

redis.on('connect', function() {
  console.log('Connection with redis server established');
  isConnected = true;
  initDB();
})

redis.on('reconnecting', function() {
  console.log('Reconnecting')
})

redis.on('error', function() {

})

redis.on('end', function() {
  console.log("Could not contact the redis server");
})

redis.monitor(function() {});
redis.on('monitor', function() {
  console.log(arguments[1])
})

function hit(userConnected) {
  redis.incr("hits", sendUpdate);

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
