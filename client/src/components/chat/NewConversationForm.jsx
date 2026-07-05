import { useCallback, useState } from 'react';
import { Wrench } from 'lucide-react';
import { TextField } from '../ui/TextField.jsx';
import { TextArea } from '../ui/TextArea.jsx';
import { Button } from '../ui/Button.jsx';
import { sanitizeInput } from '../../utils/sanitize.js';
import { newConversationSchema, validateForm } from '../../utils/validation.js';
import { trackInteraction } from '../../utils/analytics.js';
import { socket } from '../../lib/socket.js';

export function NewConversationForm({ onCreated }) {
  const [values, setValues] = useState({ customerName: '', deviceType: '', issueSummary: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = useCallback(
    (field) => (event) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setSubmitError('');

      const clean = {
        customerName: sanitizeInput(values.customerName),
        deviceType: sanitizeInput(values.deviceType),
        issueSummary: sanitizeInput(values.issueSummary),
      };

      const { success, errors: validationErrors } = validateForm(newConversationSchema, clean);
      if (!success) {
        setErrors(validationErrors);
        trackInteraction('new_conversation_validation_failed', {
          fields: Object.keys(validationErrors),
        });
        return;
      }

      setIsSubmitting(true);
      socket.emit('conversation:create', clean, (response) => {
        setIsSubmitting(false);
        if (response?.success) {
          trackInteraction('conversation_started');
          onCreated(response.conversation);
        } else if (response?.errors) {
          setErrors(response.errors);
        } else {
          setSubmitError('Something went wrong. Please try again.');
        }
      });
    },
    [values, onCreated],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-ink-200 bg-white p-6 shadow-panel sm:p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-white">
          <Wrench className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-semibold text-ink-900">Start a repair support chat</h1>
        <p className="text-sm text-ink-500">
          Tell us about your device and issue — a technician will join shortly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Your name"
          value={values.customerName}
          onChange={handleChange('customerName')}
          error={errors.customerName}
          required
          maxLength={60}
          autoComplete="name"
          placeholder="e.g. Jordan Lee"
        />
        <TextField
          label="Device type"
          value={values.deviceType}
          onChange={handleChange('deviceType')}
          error={errors.deviceType}
          required
          maxLength={80}
          placeholder="e.g. iPhone 14 Pro, Dell XPS 13"
        />
        <TextArea
          label="Describe the issue"
          value={values.issueSummary}
          onChange={handleChange('issueSummary')}
          error={errors.issueSummary}
          required
          maxLength={500}
          rows={4}
          placeholder="e.g. Screen is cracked and touch stopped responding after a drop."
        />

        {submitError && (
          <p role="alert" className="text-sm font-medium text-danger">
            {submitError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Start chat
        </Button>
      </form>
    </div>
  );
}
