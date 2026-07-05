export function TypingIndicator({ label }) {
  return (
    <div className="flex items-center gap-2 px-1 text-xs text-ink-500" role="status">
      <span className="flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink-400 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink-400 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink-400 [animation-delay:300ms]" />
      </span>
      <span>{label}</span>
    </div>
  );
}
