import { z } from 'zod';

export const newConversationSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(60, 'Name must be under 60 characters.'),
  deviceType: z
    .string()
    .trim()
    .min(2, 'Please specify a device type.')
    .max(80, 'Device type must be under 80 characters.'),
  issueSummary: z
    .string()
    .trim()
    .min(5, 'Please describe the issue in at least 5 characters.')
    .max(500, 'Issue summary must be under 500 characters.'),
});

export const messageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(2000, 'Message must be under 2000 characters.'),
});

/**
 * Runs a Zod schema and returns { success, errors } with field-keyed error
 * messages, ready to bind directly to form field error states.
 */
export function validateForm(schema, values) {
  const result = schema.safeParse(values);
  if (result.success) {
    return { success: true, errors: {} };
  }
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}
