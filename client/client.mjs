import WebSocket from 'ws';

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const messageTypes = {
	CLIENT_CONNECTED: 'client-connected',
        CLIENT_DISCONNECTED: 'client-disconnected',
        USER_CONNECTED: 'user-connected',
        USER_DISCONNECTED: 'user-disconnected',
};

const socket = new WebSocket('ws://localhost:8080/main');
const rl = readline.createInterface({ input, output });

const client = 'user';

socket.on('open', () => {
	const initData = JSON.stringify({
		type: 'init',
		userData: {
			userName: client,
			userTipe: 'guest',
			timestamp: Date.now(),
		}
	});

	socket.send(initData);
});

socket.on('message', (data) => {
		const { type, userData: {userName, message, timestamp} }  = JSON.parse(data);
		console.log('@' + userName, message)
});

socket.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} ${reason}`);
});

socket.on('error', (err) => {
  console.error('WebSocket error:', err);
});

rl.on('line', str => {
	if(str == 'exit') {
		socket.close();
		rl.close();
	};
	socket.send(JSON.stringify({type: 'message', userData: {userName: client, message: str}}));
});
