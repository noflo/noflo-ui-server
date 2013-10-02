var http = require('http');
var path = require('path');
var connect = require('connect');
var runtime = require('noflo-runtime-websocket');

module.exports = function (baseDir, callback) {
  var app = connect();
  // Static serving of the UI
  app.use(connect.static(path.resolve(__dirname, '../assets')));

  // Set Connect as the server middleware
  var server = http.createServer(app);

  // Provide WebSocket interface to NoFlo
  runtime(server, {
    baseDir: baseDir,
    catchExceptions: true,
    captureOutput: true
  });

  // Return prepared server to caller
  callback(null, server);
};
