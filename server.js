const WebSocket = require('ws')
const port = 6969
const Server = new WebSocket.Server({port: port})

console.log(`Starting server on port ${port}`)

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