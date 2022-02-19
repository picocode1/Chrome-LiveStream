const WebSocket = require('ws')
const http = require("http");
const express = require('express');

const WS_PORT = 6969
const HTTP_PORT = 80;
const HTTP_HOST = '127.0.0.1';

const Server = new WebSocket.Server({port: WS_PORT})

console.log(`WebSocket: Starting server on port ${WS_PORT}`)

console.log(`Start LiveStream from http://${HTTP_HOST}:${HTTP_PORT}/screenshare`)
console.log(`Watch LiveStream from http://${HTTP_HOST}:${HTTP_PORT}/livestream\n`)


//Use express
var app = express();
app.use(express.static('public'))

//Send livestream file
app.get('/livestream', function(req, res) {
    res.sendFile(__dirname + '/livestream.html')
})

//Send screenshare file
app.get('/screenshare', function(req, res) {
    res.sendFile(__dirname + '/screenshare.html')
})

//Start webserver
var server = app.listen(HTTP_PORT, function(){
    console.log(`HTTP Server is running on http://${HTTP_HOST}:${HTTP_PORT}`);
});




//Function to only send data to everyone except the sender so we dont send the livestream back to the 
function ScreenCapture(data, sender) {
	Server.clients.forEach(function(client) {
		if (client !== sender) {
			client.send(data)
		}
	})
}

Server.on('connection', (ws, req, client) => {
	//Log every new connection
	console.log('Received connection from', ws._socket.remoteAddress.slice(7))
	
	ws.on('message', function(received_data) {
		var data = String(received_data)

		//If data is less then 50 bytes its settings/viewcount etc
		if (data.length < 50){
			Server.clients.forEach(function(client) {
				client.send(data)
			})
		}
		else
		{
			ScreenCapture(data, ws);
		}
	})
})

//Live viewcounter every 5 seconds
setInterval(function(){
	Server.clients.forEach(function(client) {
		client.send(JSON.stringify({
			viewcount: Server.clients.size - 1 
		}))
	})
}, 5 * 1000);
