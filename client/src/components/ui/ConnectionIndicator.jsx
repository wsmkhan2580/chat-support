const CONFIG = {
  connected: { label: 'Connected', dot: 'bg-success' },
  connecting: { label: 'Connecting…', dot: 'bg-warning animate-pulseDot' },
  reconnecting: { label: 'Reconnecting…', dot: 'bg-warning animate-pulseDot' },
  offline: { label: 'Offline', dot: 'bg-danger' },
};

/**
 * Small live-region indicator so users always know the real-time channel's
 * health. aria-live="polite" ensures screen readers hear status changes
 * (e.g. "Offline" -> "Reconnecting…" -> "Connected") without interrupting.
 */
export function ConnectionIndicator({ status }) {
  const config = CONFIG[status] || CONFIG.offline;
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1"
      role="status"
      aria-live="polite"
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden="true" />
      <span className="text-xs font-medium text-ink-600">{config.label}</span>
    </div>
  );
}
