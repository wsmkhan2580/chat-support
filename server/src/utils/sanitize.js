import sanitizeHtml from 'sanitize-html';

/**
 * Strips all HTML tags and attributes from user-supplied text to prevent
 * stored/reflected XSS. Chat is plain text only — no rich HTML is ever
 * accepted from clients, so we disallow all tags rather than trying to
 * maintain an "allowed tag" list.
 *
 * @param {string} input
 * @returns {string}
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') {
    return '';
  }

  const stripped = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });

  return stripped.trim();
}

/**
 * Sanitizes every string field on a plain object (shallow).
 * @param {Record<string, unknown>} obj
 * @param {string[]} fields
 */
export function sanitizeFields(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = sanitizeText(result[field]);
    }
  }
  return result;
}
