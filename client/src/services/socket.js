import { io } from 'socket.io-client';

let socket = null;

export function getSocketUrl() {
  // 1. Explicit socket URL if provided
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (explicitSocketUrl && explicitSocketUrl.trim()) {
    return explicitSocketUrl.trim().replace(/\/+$/, '');
  }

  // 2. Derive from VITE_API_URL if provided (strip trailing slashes and /api suffix)
  const rawApiUrl = import.meta.env.VITE_API_URL;
  if (rawApiUrl && rawApiUrl.trim()) {
    return rawApiUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '').replace(/\/+$/, '');
  }

  // 3. In local development on localhost/127.0.0.1
  const isDev =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname));
  if (isDev) {
    return 'http://localhost:5000';
  }

  // 4. Production default (Render backend) - never default to the Vercel frontend origin
  return 'https://quilio.onrender.com';
}

export function connectSocket(token) {
  if (!token) return null;
  if (socket?.connected) return socket;
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  const targetUrl = getSocketUrl();
  socket = io(targetUrl, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
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
