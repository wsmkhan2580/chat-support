import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Wrench } from 'lucide-react';
import { NewConversationForm } from '../components/chat/NewConversationForm.jsx';
import { ChatThread } from '../components/chat/ChatThread.jsx';
import { ConnectionIndicator } from '../components/ui/ConnectionIndicator.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import { useConnectionStatus } from '../hooks/useConnectionStatus.js';
import { useConversation } from '../hooks/useConversation.js';
import { trackInteraction } from '../utils/analytics.js';

const STORAGE_KEY = 'fixpoint_active_conversation';

export function CustomerPage() {
  const connectionStatus = useConnectionStatus();
  const [conversationId, setConversationId] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (conversationId) {
      try {
        sessionStorage.setItem(STORAGE_KEY, conversationId);
      } catch {
        // sessionStorage may be unavailable (e.g. private browsing); non-fatal.
      }
    }
  }, [conversationId]);

  const handleCreated = useCallback((conversation) => {
    setConversationId(conversation._id);
    setCustomerName(conversation.customerName);
  }, []);

  const handleStartOver = useCallback(() => {
    trackInteraction('conversation_reset');
    setConversationId(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const {
    conversation,
    messages,
    isLoading,
    error,
    peerTyping,
    sendMessage,
    notifyTyping,
  } = useConversation(conversationId, { role: 'customer', name: customerName || 'Customer' });

  useEffect(() => {
    if (conversation?.customerName) {
      setCustomerName(conversation.customerName);
    }
  }, [conversation]);

  if (!conversationId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 py-12">
        <NewConversationForm onCreated={handleCreated} />
        <p className="mt-6 text-center text-xs text-ink-400">
          FixPoint Electronics Repair · Live Support
        </p>
      </div>
    );
  }

  const isResolved = conversation?.status === 'resolved';

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStartOver}
            aria-label="Start a new conversation"
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-white">
            <Wrench className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-ink-900">FixPoint Support</h1>
            {conversation && (
              <div className="flex items-center gap-2">
                <StatusBadge status={conversation.status} />
              </div>
            )}
          </div>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        {error ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          </div>
        ) : (
          <ChatThread
            role="customer"
            messages={messages}
            isLoading={isLoading}
            peerTyping={peerTyping}
            peerLabel="Support agent"
            onSend={sendMessage}
            onTyping={notifyTyping}
            disabled={isResolved || connectionStatus === 'offline'}
            disabledReason={
              isResolved
                ? 'This conversation has been resolved.'
                : 'Reconnecting — you can type again once back online.'
            }
          />
        )}
      </main>
    </div>
  );
}
