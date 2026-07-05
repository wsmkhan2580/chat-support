const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
];

export function StatusFilterTabs({ active, onChange, counts }) {
  return (
    <div role="tablist" aria-label="Filter conversations by status" className="flex gap-1 overflow-x-auto p-1">
      {FILTERS.map((filter) => {
        const isActive = active === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.key)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 ${
              isActive ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-100'
            }`}
          >
            {filter.label}
            {typeof counts?.[filter.key] === 'number' && (
              <span className={`ml-1.5 ${isActive ? 'text-ink-300' : 'text-ink-400'}`}>
                {counts[filter.key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
