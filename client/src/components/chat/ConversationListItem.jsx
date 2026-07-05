import { StatusBadge } from '../ui/StatusBadge.jsx';
import { formatRelative, initials } from '../../utils/format.js';

export function ConversationListItem({ conversation, isActive, onSelect }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? 'true' : undefined}
        className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 ${
          isActive
            ? 'border-ink-900 bg-ink-900 text-white'
            : 'border-transparent bg-white hover:border-ink-200 hover:bg-ink-50'
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            isActive ? 'bg-white/15 text-white' : 'bg-ink-100 text-ink-700'
          }`}
          aria-hidden="true"
        >
          {initials(conversation.customerName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={`truncate text-sm font-semibold ${isActive ? 'text-white' : 'text-ink-900'}`}>
              {conversation.customerName}
            </span>
            {conversation.unreadForAgent && (
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${isActive ? 'bg-white' : 'bg-ink-900'}`}
                aria-label="Unread messages"
              />
            )}
          </span>
          <span className={`block truncate text-xs ${isActive ? 'text-ink-200' : 'text-ink-500'}`}>
            {conversation.deviceType}
          </span>
          <span className={`mt-1 block truncate text-xs ${isActive ? 'text-ink-300' : 'text-ink-400'}`}>
            {conversation.lastMessagePreview || conversation.issueSummary}
          </span>
          <span className="mt-2 flex items-center justify-between gap-2">
            <StatusBadge status={conversation.status} />
            <span className={`text-[11px] ${isActive ? 'text-ink-300' : 'text-ink-400'}`}>
              {formatRelative(conversation.lastMessageAt)}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
