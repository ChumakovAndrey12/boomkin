'use strict'

import { createServer } from 'http';

import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

function main() {

	const server = createServer();
	const wsServer = new WebSocketServer({noServer: true});

	const clients = [];

	wsServer.on('connection',(conection, request) => {

		conection.id = uuidv4();
		clients.push(conection);


		const ip = request.socket.remoteAddress;
		const path = request.url;
  		console.log('connection from IP:', ip, 'on path[ ', path, ' ]'); // TODO сделать реализацию юай с 3 последними подключениями и кол-вом конекшенов.

		
		conection.on('error', console.error);
		conection.on('message', data => {
			clients.forEach(client => {
				if( conection !== client ) client.send(data);
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
