import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

/**
 * Manages the full lifecycle of viewing one conversation thread: joining
 * its Socket.io room, receiving the message backlog, listening for new
 * messages and typing indicators in real time, and exposing a `sendMessage`
 * action with request/response semantics via Socket.io acknowledgements.
 */
export function useConversation(conversationId, { role, name }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    function join() {
      socket.emit('conversation:join', { conversationId }, (response) => {
        if (cancelled) {
          return;
        }
        if (!response?.success) {
          setError(response?.error || 'Unable to load this conversation.');
          setIsLoading(false);
          return;
        }
        setConversation(response.conversation);
        setMessages(response.messages || []);
        setIsLoading(false);
        if (role === 'agent') {
          socket.emit('conversation:read', { conversationId });
        }
      });
    }

    if (socket.connected) {
      join();
    } else {
      socket.once('connect', join);
    }

    const handleNewMessage = (message) => {
      if (message.conversationId !== conversationId) {
        return;
      }
      setMessages((prev) => [...prev, message]);
      if (role === 'agent' && message.sender === 'customer') {
        socket.emit('conversation:read', { conversationId });
      }
    };

    const handleConversationUpdated = (updated) => {
      if (updated._id === conversationId) {
        setConversation(updated);
      }
    };

    const handleTyping = (payload) => {
      if (payload.conversationId !== conversationId) {
        return;
      }
      if (payload.sender === role) {
        return;
      }
      setPeerTyping(payload.isTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (payload.isTyping) {
        typingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 3000);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('typing:update', handleTyping);

    return () => {
      cancelled = true;
      socket.off('connect', join);
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('typing:update', handleTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, role]);

  const sendMessage = useCallback(
    (text) =>
      new Promise((resolve) => {
        socket.emit(
          'message:send',
          { conversationId, text, sender: role, senderName: name },
          (response) => {
            resolve(response);
          },
        );
      }),
    [conversationId, role, name],
  );

  const setStatus = useCallback(
    (status) =>
      new Promise((resolve) => {
        socket.emit('conversation:status', { conversationId, status }, (response) => {
          resolve(response);
        });
      }),
    [conversationId],
  );

  const notifyTyping = useCallback(
    (isTyping) => {
      socket.emit('typing:update', { conversationId, isTyping, sender: role });
    },
    [conversationId, role],
  );

  return {
    conversation,
    messages,
    isLoading,
    error,
    peerTyping,
    sendMessage,
    setStatus,
    notifyTyping,
  };
}
