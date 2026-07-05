import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * A single shared Socket.io connection for the whole app. Autoconnect is
 * disabled so we can control exactly when the connection opens (after the
 * app mounts) and show accurate connection-state UI from the very first
 * render rather than assuming "connected".
 */
export const socket = io(API_URL, {
  autoConnect: false,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 8000,
});
