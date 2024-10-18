import io from 'socket.io-client';

const socket = io('http://localhost:5173', {
  transports: ['websocket'],
});

export default socket;
