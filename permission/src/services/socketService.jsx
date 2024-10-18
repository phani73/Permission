import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join the socket room based on faculty's year
export const joinRoom = (username, year) => {
  socket.emit('join', { username, year });
};

// Handle WebSocket events
export const onPermissionAccepted = (callback) => {
  socket.on('permissionAccepted', (permission) => {
    console.log('Permission accepted:', permission);
    callback(permission);
  });
};

// Add more event handlers as needed

export default socket;
