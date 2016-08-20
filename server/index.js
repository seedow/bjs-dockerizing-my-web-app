var config = require('./config.js'),
  WebSocketServer = require('ws').Server,
  redis = require('redis');

var wss = new WebSocketServer({
  port: config.wsPort
})

var client = redis.createClient(config.redisPort, config.redisUrl);

function initDB() {
  client.exists('usersConnected', function(err, reply) {
    if (reply !== 1) {
      client.set("usersConnected", 0);
      console.log('Db initialized');
    } else {
      console.log('Db already exists');
    }
  })
}

client.on('connect', function() {
  console.log('Redis connected');
  initDB();
})

client.on('error', function() {
  console.log(
    'Something went wrong when connecting to redis, reconnecting ...');
})

function setConnectedUsers(userConnected) {

  if (userConnected) {
    client.incr("usersConnected");
  } else {
    client.decr("usersConnected");
  }
  client.get("usersConnected", sendUpdate)
}

wss.on('connection', function connection(ws) {
  console.log('%s connected ', ws.upgradeReq.connection.remoteAddress);
  setConnectedUsers(true);

  ws.on('close', function incoming() {
    console.log('%s isconnected', ws.upgradeReq.connection.remoteAddress);
    setConnectedUsers(false);
  });

});

var sendUpdate = function(err, connections) {
  wss.clients.forEach(function(client) {
    client.send(connections.toString())
  })
}
