// this is how we will require our module
const fs = require("fs-extra");
var WebSocketServer = require('websocket').server;
var http = require('http');
var streamToBuffer = require('stream-to-buffer')

let clients = new Map();

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function (request) {

    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var index = clients.size;
    var connection = request.accept('echo-protocol', request.origin);
    clients.set(index, connection);
    console.log((new Date()) + ' - Connection accepted.');


    let clientsList = [];

    for (let [key, client] of clients)
        clientsList.push(key);

    clientsList = JSON.stringify({ type: "usersList", clients: clientsList });
    console.log(clientsList);

    for (let [key, client] of clients)
        if (client != connection)
            client.sendUTF(clientsList);

    connection.on('message', function (message) {
    });

    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        clients.delete(index);
    });
});