import { useCallback, useEffect, useState } from 'react';
import { socket } from '../lib/socket.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Loads the initial conversation list over REST (fast first paint, works
 * even before the socket finishes connecting) then keeps it live via
 * Socket.io events for new conversations and updates — no polling.
 */
export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/conversations`);
      if (!res.ok) {
        throw new Error('Failed to load conversations.');
      }
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading conversations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    socket.emit('agent:join');

    const upsert = (conversation) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        const next = exists
          ? prev.map((c) => (c._id === conversation._id ? conversation : c))
          : [conversation, ...prev];
        return [...next].sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
        );
      });
    };

    socket.on('conversation:new', upsert);
    socket.on('conversation:updated', upsert);

    return () => {
      socket.off('conversation:new', upsert);
      socket.off('conversation:updated', upsert);
    };
  }, []);

  return { conversations, isLoading, error, refetch: fetchConversations };
}
