import { useCallback, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { TextField } from '../ui/TextField.jsx';
import { Button } from '../ui/Button.jsx';
import { sanitizeInput } from '../../utils/sanitize.js';
import { trackInteraction } from '../../utils/analytics.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AgentAccessGate({ onVerified }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const clean = sanitizeInput(code);

      if (!clean) {
        setError('Access code is required.');
        return;
      }

      setIsSubmitting(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/api/agent/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: clean }),
        });
        const data = await res.json();
        if (data.valid) {
          trackInteraction('agent_login_success');
          onVerified();
        } else {
          setError('Invalid access code. Please try again.');
          trackInteraction('agent_login_failed');
        }
      } catch {
        setError('Unable to verify access code. Please check your connection.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [code, onVerified],
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-ink-200 bg-white p-8 shadow-panel">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="text-lg font-semibold text-ink-900">Staff Console</h1>
          <p className="text-sm text-ink-500">Enter your access code to manage live chats.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <TextField
            label="Access code"
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            error={error}
            required
            autoComplete="off"
            placeholder="Enter staff access code"
          />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
