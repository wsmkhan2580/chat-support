import { formatTime } from '../../utils/format.js';

/**
 * Renders a single chat message. Text is always inserted as plain React
 * children (never dangerouslySetInnerHTML), so even if sanitization
 * upstream ever had a gap, React's default escaping still prevents any
 * markup from executing.
 */
export function MessageBubble({ message, isOwn }) {
  return (
    <li
      className={`flex animate-fadeIn flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${
          isOwn
            ? 'rounded-br-sm bg-ink-900 text-white'
            : 'rounded-bl-sm border border-ink-200 bg-white text-ink-900'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
      </div>
      <span className="px-1 text-[11px] text-ink-400">
        {message.senderName} · {formatTime(message.createdAt)}
      </span>
    </li>
  );
}
