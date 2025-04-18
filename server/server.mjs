'use strict'

import { createServer } from 'http';
import { WebSocketServer } from 'ws';

function main() {

	const server = createServer();
	const wsServer = new WebSocketServer({noServer: true});

	const clients = [];

	wsServer.on('connection',(conection, request) => {
		clients.push(conection);
		const ip = request.socket.remoteAddress;
		const path = request.url;
  		console.log('🟢 Connection from IP:', ip, 'on path[ ', path, ' ]');
		conection.on('error', console.error);
		conection.on('message', data => {
			clients.forEach(client => {
				if( conection !== client ) client.send(data)
			});
		});
	});

	server.on('upgrade', (request, socket, head) => {
  		const { pathname } = new URL(request.url, 'wss://base.url');

  		if (pathname === '/chat') {
    			wsServer.handleUpgrade(request, socket, head, (ws, request) =>  {
      				wsServer.emit('connection', ws, request);
    			});
  		}
  		else {
    			socket.destroy();
 		}
	});

	server.listen(8080);
	console.log('Server is running.');
};

main();
