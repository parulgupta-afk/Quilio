import { io } from 'socket.io-client';
let socket = null;
export function connectSocket(token) {
  if (!token) return null;
  if (socket?.connected) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}
export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
export function getSocket() { return socket; }
