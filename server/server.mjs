'use strict'

import { createServer } from 'http';

import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

function main() {

	const server = createServer();
	const wsServer = new WebSocketServer({noServer: true});

	const clients = [];
	const rooms = new Set(['/main']);
	
	const broadcast = (data, clients, senderId) => 
		clients.forEach(client => {
			const { id } = client
			if( id !== senderId ) client.send(data);
		});

	const routing = (path, upgradeConnection, rejectConnection) => {
		if (rooms.has(path)) upgradeConnection();
		else rejectConnection();
    	};

	wsServer.on('connection',(conection, request) => {

		conection.id = uuidv4();
		clients.push(conection);


		const ip = request.socket.remoteAddress;
		const path = request.url;
  		console.log('connection from IP:', ip, 'on path[ ', path, ' ]'); // TODO сделать реализацию юай с 3 последними подключениями и кол-вом конекшенов.

		
		conection.on('error', console.error);
		conection.on('message', data => {
			const {type, userData} = JSON.parse(data);

			if(type === 'init') {
				conection.userData = userData;

				const data = JSON.stringify({
					type,
					userData: { message: 'joined', ...userData},
				});

				broadcast(data, clients, conection.id); 
			};

	});
	});

	server.on('upgrade', (request, socket, head) => {
  		const { pathname } = new URL(request.url, 'wss://localhost.url');

		routing(
			pathname, 
			() => wsServer.handleUpgrade(
				request, 
				socket, 
				head, 
				(ws, request) => wsServer.emit('connection', ws, request)),
			() => socket.destroy()
		);
	});

	server.listen(8080);
	console.log('Server is running.');
	
};

main();
