import { z } from 'zod';

export const createConversationSchema = z.object({
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

export const sendMessageSchema = z.object({
  conversationId: z.string().trim().min(1, 'A conversation is required.'),
  text: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(2000, 'Message must be under 2000 characters.'),
  sender: z.enum(['customer', 'agent'], {
    errorMap: () => ({ message: 'Sender must be customer or agent.' }),
  }),
  senderName: z
    .string()
    .trim()
    .min(1, 'Sender name is required.')
    .max(60, 'Sender name must be under 60 characters.'),
});

export const updateStatusSchema = z.object({
  conversationId: z.string().trim().min(1, 'A conversation is required.'),
  status: z.enum(['open', 'pending', 'resolved'], {
    errorMap: () => ({ message: 'Invalid status value.' }),
  }),
});

export const typingSchema = z.object({
  conversationId: z.string().trim().min(1),
  isTyping: z.boolean(),
  sender: z.enum(['customer', 'agent']),
});

/**
 * Runs a Zod schema and returns a normalized { success, data, errors } shape
 * so callers (REST controllers and socket handlers) don't need to know
 * anything about Zod's internal error format.
 */
export function validate(schema, payload) {
  const result = schema.safeParse(payload);
  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'form';
    errors[key] = issue.message;
  }
  return { success: false, data: null, errors };
}
