import { Inbox } from 'lucide-react';

/**
 * Shown whenever a list/collection legitimately has zero items — as
 * opposed to an error or loading state. Always announces via role="status"
 * so screen reader users aren't left wondering if the page is broken.
 */
export function EmptyState({
  title = 'No data found.',
  description,
  icon: Icon = Inbox,
  action,
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-ink-200 bg-white px-6 py-12 text-center"
    >
      <Icon className="h-8 w-8 text-ink-300" aria-hidden="true" />
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {description && <p className="max-w-xs text-xs text-ink-500">{description}</p>}
      {action}
    </div>
  );
}
