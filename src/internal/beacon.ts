/**
 * @quikturn/logos SDK — Usage Telemetry Beacon
 *
 * Fire-and-forget 1x1 pixel recording SDK page usage.
 * Telemetry only — does not verify attribution placement.
 * Deduplicates by token (at most once per page load).
 */

import { BASE_URL } from "../constants";

/** Tracks which tokens have already fired a beacon on this page. */
const firedTokens = new Set<string>();

/**
 * Fires a 1x1 tracking pixel to `/_beacon`. Telemetry only — does not
 * verify attribution placement.
 *
 * @param token - Publishable API token (qt_/pk_ prefix).
 */
export function fireBeacon(token: string): void {
  // SSR guard
  if (typeof window === "undefined") return;

  // Skip empty tokens
  if (!token) return;

  // Skip server keys
  if (token.startsWith("sk_")) return;

  // Deduplicate per token
  if (firedTokens.has(token)) return;
  firedTokens.add(token);

  // Fire telemetry pixel (fire-and-forget; no response is read)
  const img = new Image();
  img.src = `${BASE_URL}/_beacon?token=${token}&page=${encodeURIComponent(location.href)}`;
}

/**
 * Resets the internal deduplication set. Exposed for testing only.
 * @internal
 */
export function _resetBeacon(): void {
  firedTokens.clear();
}
