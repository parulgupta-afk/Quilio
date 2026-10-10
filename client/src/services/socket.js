import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  if (!token) return null;
  if (socket?.connected) return socket;
  const url = import.meta.env.VITE_SOCKET_URL || undefined;
  socket = io(url || '/', {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  socket.on('connect_error', (err) => console.warn('[socket]', err.message));
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
