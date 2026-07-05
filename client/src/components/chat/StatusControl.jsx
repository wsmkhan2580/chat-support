import { useId } from 'react';

export function StatusControl({ status, onChange, disabled }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs font-medium text-ink-500">
        Status
      </label>
      <select
        id={id}
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-ink-300 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="open">Open</option>
        <option value="pending">Pending</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
  );
}
