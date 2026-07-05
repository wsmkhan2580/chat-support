import { useCallback, useMemo, useState } from 'react';
import { Wrench, PanelLeftClose, PanelLeft, MessagesSquare } from 'lucide-react';
import { ConversationListItem } from '../components/chat/ConversationListItem.jsx';
import { StatusFilterTabs } from '../components/chat/StatusFilterTabs.jsx';
import { StatusControl } from '../components/chat/StatusControl.jsx';
import { ChatThread } from '../components/chat/ChatThread.jsx';
import { ConnectionIndicator } from '../components/ui/ConnectionIndicator.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { ConversationListSkeleton } from '../components/ui/LoadingState.jsx';
import { AgentAccessGate } from '../components/chat/AgentAccessGate.jsx';
import { useConnectionStatus } from '../hooks/useConnectionStatus.js';
import { useConversations } from '../hooks/useConversations.js';
import { useConversation } from '../hooks/useConversation.js';
import { useToast } from '../context/ToastContext.jsx';
import { trackInteraction } from '../utils/analytics.js';
import { initials } from '../utils/format.js';

const AGENT_NAME = 'Support Agent';
const SESSION_KEY = 'fixpoint_agent_verified';

export function AgentPage() {
  const [verified, setVerified] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleVerified = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setVerified(true);
  }, []);

  if (!verified) {
    return <AgentAccessGate onVerified={handleVerified} />;
  }

  return <AgentDashboard />;
}

function AgentDashboard() {
  const connectionStatus = useConnectionStatus();
  const { conversations, isLoading, error, refetch } = useConversations();
  const [filter, setFilter] = useState('all');
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const notify = useToast();

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return conversations;
    }
    return conversations.filter((c) => c.status === filter);
  }, [conversations, filter]);

  const counts = useMemo(
    () => ({
      all: conversations.length,
      open: conversations.filter((c) => c.status === 'open').length,
      pending: conversations.filter((c) => c.status === 'pending').length,
      resolved: conversations.filter((c) => c.status === 'resolved').length,
    }),
    [conversations],
  );

  const activeConversation = conversations.find((c) => c._id === activeId) || null;

  const {
    messages,
    isLoading: isThreadLoading,
    error: threadError,
    peerTyping,
    sendMessage,
    setStatus,
    notifyTyping,
  } = useConversation(activeId, { role: 'agent', name: AGENT_NAME });

  const handleSelect = useCallback((id) => {
    setActiveId(id);
    trackInteraction('conversation_opened', { conversationId: id });
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleStatusChange = useCallback(
    async (status) => {
      const response = await setStatus(status);
      if (response?.success) {
        notify(`Conversation marked as ${status}.`, 'success');
        trackInteraction('conversation_status_changed', { status });
      } else {
        notify('Failed to update status. Please try again.', 'error');
      }
    },
    [setStatus, notify],
  );

  const handleSend = useCallback(
    async (text) => {
      const response = await sendMessage(text);
      if (!response?.success) {
        notify('Message failed to send. Please try again.', 'error');
      }
      return response;
    },
    [sendMessage, notify],
  );

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Hide conversation list' : 'Show conversation list'}
            aria-pressed={sidebarOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 md:hidden"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-white">
            <Wrench className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-ink-900">FixPoint Staff Console</h1>
            <p className="text-xs text-ink-500">Real-Time Chat Support</p>
          </div>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`${
            sidebarOpen ? 'flex' : 'hidden'
          } w-full max-w-full flex-col border-r border-ink-200 bg-white md:flex md:max-w-xs`}
        >
          <div className="border-b border-ink-100 px-3 pt-3">
            <StatusFilterTabs active={filter} onChange={setFilter} counts={counts} />
          </div>
          <div className="scrollbar-thin flex-1 overflow-y-auto">
            {isLoading ? (
              <ConversationListSkeleton />
            ) : error ? (
              <div className="p-4">
                <EmptyState
                  title="Unable to load conversations."
                  description={error}
                  action={
                    <button
                      type="button"
                      onClick={refetch}
                      className="mt-1 rounded-md border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
                    >
                      Retry
                    </button>
                  }
                />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No data found."
                  description="No conversations match this filter yet."
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-1.5 p-3">
                {filtered.map((conversation) => (
                  <ConversationListItem
                    key={conversation._id}
                    conversation={conversation}
                    isActive={conversation._id === activeId}
                    onSelect={() => handleSelect(conversation._id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className={`${sidebarOpen ? 'hidden' : 'flex'} min-h-0 flex-1 flex-col md:flex`}>
          {!activeConversation ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={MessagesSquare}
                title="No data found."
                description="Select a conversation from the list to view messages."
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-700"
                    aria-hidden="true"
                  >
                    {initials(activeConversation.customerName)}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-ink-900">
                      {activeConversation.customerName}
                    </h2>
                    <p className="text-xs text-ink-500">{activeConversation.deviceType}</p>
                  </div>
                </div>
                <StatusControl status={activeConversation.status} onChange={handleStatusChange} />
              </div>

              <div className="border-b border-ink-100 bg-ink-50 px-4 py-2 sm:px-6">
                <p className="text-xs text-ink-500">
                  <span className="font-medium text-ink-700">Reported issue: </span>
                  {activeConversation.issueSummary}
                </p>
              </div>

              {threadError ? (
                <div className="flex flex-1 items-center justify-center p-6">
                  <p role="alert" className="text-sm font-medium text-danger">
                    {threadError}
                  </p>
                </div>
              ) : (
                <ChatThread
                  role="agent"
                  messages={messages}
                  isLoading={isThreadLoading}
                  peerTyping={peerTyping}
                  peerLabel={activeConversation.customerName}
                  onSend={handleSend}
                  onTyping={notifyTyping}
                  disabled={activeConversation.status === 'resolved' || connectionStatus === 'offline'}
                  disabledReason={
                    activeConversation.status === 'resolved'
                      ? 'This conversation has been resolved.'
                      : 'Reconnecting — you can type again once back online.'
                  }
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
