import { useId } from 'react';

export function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  required = false,
  placeholder,
  maxLength,
  rows = 3,
  ...props
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-800">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`w-full resize-none rounded-md border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          error
            ? 'border-danger focus-visible:outline-danger'
            : 'border-ink-300 focus-visible:outline-ink-900'
        }`}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
