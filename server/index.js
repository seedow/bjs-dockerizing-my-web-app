var config = require('./config.js'),
  WebSocketServer = require('ws').Server,
  redis = require('redis'),
  winston = require('winston');

//initialize WebSocketServer
var wss = new WebSocketServer({
  port: config.wsPort
});

// REDIS
var redis = redis.createClient(config.redisPort, config.redisUrl);

function initDB() {
  redis.exists('depth', function(err, reply) {
    if (reply !== 1) {
      //if there is no depth key in redis then set depth to 0
      redis.set("depth", 0, sendUpdate);
      winston.log('info', 'DB initialized');
    } else {
      winston.log('info', 'DB already exists');
    }
  })
}

redis.on('connect', function() {
  winston.log('info', 'Connection with redis server established');
  initDB();
})

redis.on('reconnecting', function() {
    winston.log('warn', 'Reconnecting with redis server');
  })
  //handle redis errors
redis.on('error', function() {})
  //if redis connection ends
redis.on('end', function() {
  winston.log('warn', 'Could not contact the redis server');
})

//monitor every command that goes into redis
redis.monitor(function() {});
redis.on('monitor', function() {
  winston.log('info', 'Redis says: ', arguments[1]);
});


function updateDepth() {
  redis.get("depth", function(err, meters) {
    // if (meters != config.maxDepth) redis.incr("depth", sendUpdate);
    if (meters != config.minDepth) redis.decr("depth", sendUpdate);
  })
}
// WEBSOCKETS
wss.on('connection', function connection(ws) {
  //if we get any message from any client then update the depth
  ws.on('message', function(message) {
    if (message == 'depthPing') {
      redis.get("depth", function(err, meters) {
        ws.send(meters.toString())
      })
    } else {
      winston.log('info', 'updateDept');
      updateDepth();
    }
  })
});

//send updates to all connected clients
var sendUpdate = function(err, depth) {
  winston.log('info', 'Current depth: ', depth);
  wss.clients.forEach(function(client) {
    client.send(depth.toString())
  })
}
