import DOMPurify from 'dompurify';

/**
 * Sanitizes text before it is ever rendered or sent over the socket.
 * This is defense-in-depth: the server also sanitizes on receipt, but
 * cleaning client-side too means a compromised or buggy render path never
 * has a chance to execute injected markup, and it protects the UI even
 * before a round-trip to the server completes.
 *
 * We strip all HTML — this app only ever needs plain text.
 *
 * @param {string} value
 * @returns {string}
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') {
    return '';
  }
  const clean = DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return clean.trim();
}
