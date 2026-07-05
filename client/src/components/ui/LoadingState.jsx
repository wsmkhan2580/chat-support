/**
 * Generic loading indicator. Uses role="status" + visually-hidden text so
 * assistive tech announces "Loading" without a redundant visible label
 * cluttering the UI.
 */
export function LoadingState({ label = 'Loading…', compact = false }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 text-ink-500 ${
        compact ? 'py-6' : 'py-12'
      }`}
    >
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-ink-300 border-t-ink-800"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/**
 * Skeleton rows for conversation list — communicates "content is coming"
 * during slow network conditions, rather than a blank panel.
 */
export function ConversationListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2 rounded-md border border-ink-100 p-3">
          <div className="h-3 w-2/3 animate-pulse rounded bg-ink-200" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-ink-100" />
        </div>
      ))}
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-10 w-2/5 animate-pulse rounded-lg bg-ink-100 ${
            i % 2 === 0 ? 'self-start' : 'self-end'
          }`}
        />
      ))}
    </div>
  );
}
