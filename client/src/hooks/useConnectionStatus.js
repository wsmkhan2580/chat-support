import { useEffect, useState } from 'react';
import { socket } from '../lib/socket.js';

/**
 * Tracks Socket.io connection lifecycle so the UI can surface accurate
 * "connecting / connected / reconnecting / offline" states instead of
 * silently failing on slow or dropped connections.
 */
export function useConnectionStatus() {
  const [status, setStatus] = useState(socket.connected ? 'connected' : 'connecting');

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => setStatus('connected');
    const handleDisconnect = () => setStatus('offline');
    const handleReconnectAttempt = () => setStatus('reconnecting');
    const handleConnectError = () => setStatus('offline');

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  return status;
}
