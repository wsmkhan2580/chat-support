/**
 * Lightweight telemetry simulation. In a production system this would post
 * to an analytics/ingestion endpoint (e.g. Segment, Amplitude, or an
 * internal events service). For this project it logs to the console so
 * the interaction stream is visible during development and review.
 *
 * @param {string} action - short description of the user action
 * @param {Record<string, unknown>} [meta] - optional structured context
 */
export function trackInteraction(action, meta) {
  const entry = {
    action,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
  // eslint-disable-next-line no-console
  console.log('[Analytics] User interacted with Real-Time Chat Support', entry);
}
