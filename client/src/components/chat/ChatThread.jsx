import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import { MessageComposer } from './MessageComposer.jsx';
import { MessageListSkeleton } from '../ui/LoadingState.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { MessageCircle } from 'lucide-react';

export function ChatThread({
  role,
  messages,
  isLoading,
  peerTyping,
  peerLabel,
  onSend,
  onTyping,
  disabled,
  disabledReason,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, peerTyping]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4 sm:px-6"
        aria-live="polite"
        aria-label="Message thread"
      >
        {isLoading ? (
          <MessageListSkeleton />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No data found."
            description="No messages yet. Send the first message to start the conversation."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((message) => (
              <MessageBubble key={message._id} message={message} isOwn={message.sender === role} />
            ))}
          </ul>
        )}
        {peerTyping && (
          <div className="mt-2">
            <TypingIndicator label={`${peerLabel} is typing…`} />
          </div>
        )}
      </div>
      <MessageComposer
        onSend={onSend}
        onTyping={onTyping}
        disabled={disabled}
        disabledReason={disabledReason}
      />
    </div>
  );
}
