import WebSocket from 'ws';

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';


const socket = new WebSocket('ws://localhost:8080/chat');
const rl = readline.createInterface({ input, output });

const client = '@user';


function isJSON(str) {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
}


socket.on('open', () => {
	socket.send(client + ' joined.');
});

socket.on('message', (data) => {
	const message = data.toString();

	if(isJSON(message)) {
		const [userName, str]  = JSON.parse(message);
		console.log(userName + ': ' + str);
	} else {
		console.log('str: ' + message);
	}
});

socket.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} ${reason}`);
});

socket.on('error', (err) => {
  console.error('WebSocket error:', err);
});

rl.on('line', str => {
	if(str == 'exit') rl.close();
	socket.send(JSON.stringify([client, str]));
});
