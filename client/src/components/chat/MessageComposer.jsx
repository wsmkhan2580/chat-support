import { useCallback, useEffect, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { sanitizeInput } from '../../utils/sanitize.js';
import { messageSchema, validateForm } from '../../utils/validation.js';
import { trackInteraction } from '../../utils/analytics.js';

const MAX_LENGTH = 2000;

export function MessageComposer({ onSend, onTyping, disabled, disabledReason }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingActiveRef = useRef(false);
  const typingStopTimeout = useRef(null);

  useEffect(
    () => () => {
      if (typingStopTimeout.current) {
        clearTimeout(typingStopTimeout.current);
      }
    },
    [],
  );

  const handleChange = useCallback(
    (event) => {
      const value = event.target.value;
      setText(value);
      if (error) {
        setError('');
      }

      if (!typingActiveRef.current) {
        typingActiveRef.current = true;
        onTyping?.(true);
      }
      if (typingStopTimeout.current) {
        clearTimeout(typingStopTimeout.current);
      }
      typingStopTimeout.current = setTimeout(() => {
        typingActiveRef.current = false;
        onTyping?.(false);
      }, 1200);
    },
    [error, onTyping],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const clean = sanitizeInput(text);
      const { success, errors } = validateForm(messageSchema, { text: clean });

      if (!success) {
        setError(errors.text || 'Please enter a valid message.');
        trackInteraction('message_validation_failed', { field: 'text' });
        return;
      }

      setIsSending(true);
      const response = await onSend(clean);
      setIsSending(false);

      if (response?.success) {
        setText('');
        typingActiveRef.current = false;
        onTyping?.(false);
        trackInteraction('message_sent');
      } else {
        setError(response?.errors?.text || response?.errors?.form || 'Failed to send message.');
        trackInteraction('message_send_failed');
      }
    },
    [text, onSend, onTyping],
  );

  const remaining = MAX_LENGTH - text.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-ink-200 bg-white p-4">
      <label htmlFor="message-input" className="sr-only">
        Type your message
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="message-input"
          value={text}
          onChange={handleChange}
          disabled={disabled}
          maxLength={MAX_LENGTH}
          rows={1}
          placeholder={disabled ? disabledReason || 'Unavailable' : 'Type a message…'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'message-input-error' : undefined}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          className={`max-h-32 min-h-[44px] flex-1 resize-none rounded-md border bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 ${
            error
              ? 'border-danger focus-visible:outline-danger'
              : 'border-ink-300 focus-visible:outline-ink-900'
          }`}
        />
        <button
          type="submit"
          disabled={disabled || isSending || text.trim().length === 0}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ink-900 text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
        >
          {isSending ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <SendHorizonal className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between px-1">
        {error ? (
          <p id="message-input-error" role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : (
          <span />
        )}
        <span className={`text-xs ${remaining < 100 ? 'text-warning' : 'text-ink-400'}`}>
          {remaining} characters left
        </span>
      </div>
    </form>
  );
}
