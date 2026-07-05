const CONFIG = {
  open: { label: 'Open', className: 'bg-ink-900 text-white' },
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border border-warning/30' },
  resolved: {
    label: 'Resolved',
    className: 'bg-success/10 text-success border border-success/30',
  },
};

export function StatusBadge({ status }) {
  const config = CONFIG[status] || CONFIG.open;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
