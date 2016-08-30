var config = require('./config.js'),
  WebSocketServer = require('ws').Server,
  redis = require('redis');

var wss = new WebSocketServer({
  port: config.wsPort
})

var redis = redis.createClient(config.redisPort, config.redisUrl);


function initDB() {
  redis.exists('depth', function(err, reply) {
    if (reply !== 1) {
      redis.set("depth", 0, sendUpdate);
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

redis.on('error', function() {})

redis.on('end', function() {
  console.log("Could not contact the redis server");
})

redis.monitor(function() {});
redis.on('monitor', function() {
  console.log(arguments[1])
});

function updateDepth() {
  redis.get("depth", function(err, meters) {
    if (meters != config.maxDepth) redis.incr("depth", sendUpdate);
    // if (meters != config.minDepth) redis.decr("depth", sendUpdate);
  })
}

wss.on('connection', function connection(ws) {
  redis.get('depth', function(err, meters) {
    sendUpdate(null, meters)
  })

  ws.on('message', function() {
    updateDepth();
  })

});


var sendUpdate = function(err, depth) {
  wss.clients.forEach(function(client) {
    client.send(depth.toString())
  })
}
