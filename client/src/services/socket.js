import { io } from 'socket.io-client';

let socket = null;

/**
 * Connect with JWT from auth store. Server derives user room from token.
 */
export function connectSocket(token) {
  if (!token) return null;
  if (socket?.connected) return socket;

  // In dev, Vite proxies /api; socket connects to same origin host:5000 via env or default
  const url = import.meta.env.VITE_SOCKET_URL || undefined; // undefined = same origin / current host

  socket = io(url || '/', {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect_error', (err) => {
    console.warn('[socket] connect_error:', err.message);
  });

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
