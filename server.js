var http = require('http');
var https = require('https');
var fs = require('fs');
var app = require('./app');
var config = require('./config');

var serverOptions = config.server;
var sslOptions = {
  key: fs.readFileSync(serverOptions.key),
  cert: fs.readFileSync(serverOptions.cert),
  passphrase: serverOptions.passphrase
};

//var server = https.createServer(sslOptions, app);
var server = http.createServer(app);

var port = process.env.PORT || 3000;

// start server
server.listen(port, serverOptions.host, function() {
    console.log("Zion server listening on port " + serverOptions.port);
});
