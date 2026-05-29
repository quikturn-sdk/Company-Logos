/**
 * @quikturn/logos SDK — Search Client Function
 *
 * Standalone function for querying the Quikturn Logos /v1/search endpoint.
 * Supports both "autocomplete" and "search" modes with optional filtering,
 * pagination, sorting, and field inclusion.
 *
 * This function uses the raw Fetch API (no Authorization header). The optional
 * `token` is passed as a query parameter, matching the browser client's pattern.
 */

import type { SearchOptions, SearchResponse } from "./search-types";
import { RateLimitError, BadRequestError, AuthenticationError, ForbiddenError, NotFoundError, LogoError } from "./errors";
import { parseRetryAfter } from "./headers";
import { SEARCH_DEFAULTS, BASE_URL } from "./constants";

/** Fallback Retry-After value (seconds) when the header is absent on a 429. */
const DEFAULT_RETRY_AFTER_SECONDS = 60;

/** Default timeout (ms) applied to fetches when the caller provides no signal. */
const DEFAULT_FETCH_TIMEOUT_MS = 10000;


/** Maximum results per page for "search" mode. */
const MAX_SEARCH_LIMIT = 100;

/** Maximum results per page for "autocomplete" mode. */
const MAX_AUTOCOMPLETE_LIMIT = 20;

/** Maximum number of concurrent in-flight deduplicated requests. */
const MAX_INFLIGHT = 1000;

// ---------------------------------------------------------------------------
// Request Deduplication
// ---------------------------------------------------------------------------

/**
 * In-flight request map. Concurrent calls with identical URLs share one fetch.
 * The entry is removed when the promise settles (success or error).
 *
 * Map size is hard-capped at {@link MAX_INFLIGHT} (1000). When at capacity,
 * new requests bypass deduplication entirely. Within the cap, entries are
 * naturally bounded by the fetch timeout ({@link DEFAULT_FETCH_TIMEOUT_MS}):
 * every promise settles (and is deleted) within that window.
 *
 * @remarks **SSR / server-side rendering:** This map is module-level and
 * therefore persists for the lifetime of the Node.js process. In SSR runtimes
 * (Next.js, Nuxt, SvelteKit, …) the module is shared across requests, so
 * deduplication applies globally — two simultaneous requests from *different*
 * browser sessions with identical query URLs will share one fetch. This is
 * generally desirable (reduces upstream load), but callers that need per-request
 * isolation should pass an `AbortSignal`, which bypasses deduplication entirely.
 */
const _inflight = new Map<string, Promise<SearchResponse>>();

/**
 * @internal Test-only — clears the in-flight dedup map between test cases.
 *
 * Because `_inflight` is module-level it persists across tests in the same
 * worker process. Calling this in `beforeEach` prevents stale dedup entries
 * from causing false cache-hits or call-count mismatches.
 */
export function _resetSearchInflightForTesting(): void {
  _inflight.clear();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Searches the Quikturn Logos database for companies matching the query string.
 *
 * Builds a GET request to `/v1/search` with query parameters derived from
 * the provided options. Filter entries are serialized as `filter[key]=value`.
 *
 * Concurrent calls with identical resolved URLs share a single in-flight fetch
 * (deduplication). The promise is removed from the inflight map when it settles.
 *
 * **Modes:**
 * - `"autocomplete"` (default) — Returns up to 10 lightweight suggestions (capped at 20).
 * - `"search"` — Returns up to 25 full results with metadata (capped at 100).
 *
 * **Error handling:**
 * - HTTP 400 — Throws {@link BadRequestError}.
 * - HTTP 401 — Throws {@link AuthenticationError}.
 * - HTTP 403 — Throws {@link ForbiddenError}.
 * - HTTP 404 — Throws {@link NotFoundError}.
 * - HTTP 429 — Throws {@link RateLimitError} with the `Retry-After` value.
 * - HTTP 5xx or unknown — Throws {@link LogoError} with code `SERVER_ERROR`.
 *
 * @param options - Search configuration (query, mode, page, limit, filters, etc.)
 * @returns A {@link SearchResponse} envelope with results, pagination, and cache info.
 *
 * @throws {RateLimitError} On HTTP 429 (rate limit exceeded).
 * @throws {BadRequestError} On HTTP 400.
 * @throws {AuthenticationError} On HTTP 401.
 * @throws {ForbiddenError} On HTTP 403.
 * @throws {NotFoundError} On HTTP 404.
 * @throws {LogoError} On HTTP 5xx or other non-OK responses.
 *
 * @since 0.8.0
 *
 * @example
 * ```ts
 * import { searchLogos } from "@quikturn/logos";
 *
 * const results = await searchLogos({ q: "github", mode: "autocomplete", token: "qt_abc" });
 * console.log(results.results[0]?.name); // "GitHub"
 * ```
 */
export async function searchLogos(options: SearchOptions): Promise<SearchResponse> {
  const {
    q,
    mode = SEARCH_DEFAULTS.mode,
    page: rawPage = SEARCH_DEFAULTS.page,
    filters,
    sort,
    token,
    baseUrl,
    signal,
  } = options;

  // Clamp page to a minimum of 1. Guard against NaN/Infinity: Math.max(1, NaN)
  // returns NaN which would be serialized as the string "NaN" in query params.
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.trunc(rawPage) : SEARCH_DEFAULTS.page;

  // Apply mode-specific default limit and enforce client-side cap.
  // Guard against NaN/Infinity for the same reason as page above.
  const defaultLimit =
    mode === "search" ? SEARCH_DEFAULTS.searchLimit : SEARCH_DEFAULTS.autocompleteLimit;
  const maxLimit = mode === "search" ? MAX_SEARCH_LIMIT : MAX_AUTOCOMPLETE_LIMIT;
  const limit = Number.isFinite(options.limit)
    ? Math.max(1, Math.min(Math.trunc(options.limit!), maxLimit))
    : defaultLimit;

  const searchBase = baseUrl ?? BASE_URL;

  const params = new URLSearchParams({
    q,
    mode,
    page: String(page),
    limit: String(limit),
  });

  if (token) params.set("token", token);
  if (sort) params.set("sort", sort);

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value != null) {
        params.set(`filter[${key}]`, String(value));
      }
    }
  }

  // Use the URL constructor to correctly handle baseUrl values that include a
  // path component (e.g. "https://host/api"). A leading "/" in the path segment
  // would make it absolute and silently discard any base path, so we use a
  // relative path ("v1/search") instead. We strip trailing slashes from the base
  // before appending "/" so that "https://host///" normalises to "https://host/".
  let end = searchBase.length;
  while (end > 0 && searchBase[end - 1] === "/") end--;
  const normalizedBase = searchBase.substring(0, end) + "/";
  let endpoint: URL;
  try {
    endpoint = new URL("v1/search", normalizedBase);
  } catch {
    throw new BadRequestError(`Invalid baseUrl: ${searchBase}`);
  }
  endpoint.search = params.toString();
  const url = endpoint.toString();

  // When a signal is provided, skip deduplication: each caller manages its own
  // cancellation and sharing one fetch with different signals is not safe.
  if (signal) {
    return executeSearch(url, signal);
  }

  // Return existing in-flight promise (doesn't grow the map)
  const existing = _inflight.get(url);
  if (existing) return existing;

  // At capacity — skip dedup to prevent unbounded growth
  if (_inflight.size >= MAX_INFLIGHT) {
    return executeSearch(url);
  }

  const promise = executeSearch(url).finally(() => _inflight.delete(url));
  _inflight.set(url, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

// TODO(S1): The HTTP-status → error-class mapping here partially overlaps with
// browserFetch() in src/client/fetcher.ts. Extraction into a shared helper was
// considered but deferred because the two code paths differ in significant ways:
// browserFetch has retry logic, QuotaExceededError, server-error retry, and
// different constructor arguments for some errors. A shared helper would either
// over-parameterize or force the two callers to diverge further.

/**
 * Minimal runtime guard for the SearchResponse envelope.
 *
 * Verifies the two fields that are load-bearing for callers iterating
 * `results` and reading `total`. A 200 body that is not a SearchResponse
 * (e.g. an HTML gateway page) will be caught here rather than silently
 * returning typed-but-wrong data.
 */
function isSearchResponse(data: unknown): data is SearchResponse {
  if (data === null || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  // Envelope fields
  if (typeof d.query !== "string") return false;
  if (d.mode !== "autocomplete" && d.mode !== "search") return false;
  if (typeof d.page !== "number" || !Number.isFinite(d.page)) return false;
  if (typeof d.limit !== "number" || !Number.isFinite(d.limit)) return false;
  if (typeof d.total !== "number" || !Number.isFinite(d.total) || d.total < 0) return false;
  if (!Array.isArray(d.results)) return false;

  // Cache
  if (!d.cache || typeof d.cache !== "object") return false;
  const c = d.cache as Record<string, unknown>;
  if (typeof c.status !== "string") return false;
  if (typeof c.ttlSeconds !== "number" || !Number.isFinite(c.ttlSeconds)) return false;
  if (typeof c.version !== "string") return false;

  // Result items
  if (d.results.length > 0) {
    const valid = d.results.every((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const r = item as Record<string, unknown>;
      return (
        typeof r.domain === "string" &&
        typeof r.logoApiUrl === "string" &&
        (r.name === null || typeof r.name === "string") &&
        (r.logoUrl === null || typeof r.logoUrl === "string") &&
        typeof r.confidence === "number" && Number.isFinite(r.confidence) &&
        typeof r.source === "string" &&
        typeof r.reviewState === "string"
      );
    });
    if (!valid) return false;
  }

  return true;
}

/**
 * Executes the actual fetch call and maps HTTP errors to SDK error types.
 */
async function executeSearch(url: string, signal?: AbortSignal): Promise<SearchResponse> {
  let response: Response;

  // If no signal provided by the caller, apply a default timeout so hung
  // connections don't block indefinitely. Callers that pass their own signal
  // manage their own lifecycle (including timeout).
  let effectiveSignal: AbortSignal | undefined = signal;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (!effectiveSignal) {
    if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
      effectiveSignal = AbortSignal.timeout(DEFAULT_FETCH_TIMEOUT_MS);
    } else if (typeof AbortController !== "undefined") {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), DEFAULT_FETCH_TIMEOUT_MS);
      effectiveSignal = controller.signal;
    }
  }

  try {
    try {
      response = await globalThis.fetch(url, { signal: effectiveSignal });
    } catch (err: unknown) {
      // AbortError must pass through so callers can distinguish cancellation
      // from a genuine network failure. Wrapping it into NETWORK_ERROR would
      // silently swallow AbortSignal cancellations.
      if (err instanceof Error && err.name === "AbortError") throw err;

      const message = err instanceof Error ? err.message : "Unknown network error";
      // TODO(SDK-NEXT): pass `{ cause: err }` once LogoError constructor accepts ErrorOptions
      // to preserve the original stack trace on network failures.
      throw new LogoError(`Network error: ${message}`, "NETWORK_ERROR");
    }

    if (!response.ok) {
      // Attempt to surface a server-provided error message from the response body.
      // Read as text first, then try JSON parse — avoids double-consume of the body
      // stream that would occur if response.json() failed and we fell back to
      // response.text() on the same (already-consumed) response.
      let errorMessage: string | undefined;
      try {
        const contentLength = parseInt(response.headers.get("content-length") ?? "0", 10);
        if (contentLength > 1024) throw new Error("body too large");
        const rawText = await response.text();
        try {
          const parsed = JSON.parse(rawText) as { message?: string; error?: string };
          errorMessage = parsed.message ?? parsed.error;
        } catch {
          if (rawText && rawText.length < 500) errorMessage = rawText.trim();
        }
      } catch {
        // body unreadable, use default
      }

      if (response.status === 429) {
        const retryAfter = parseRetryAfter(response.headers) ?? DEFAULT_RETRY_AFTER_SECONDS;

        const remainingHeader = response.headers.get("X-RateLimit-Remaining");
        const parsedRemaining = parseInt(remainingHeader ?? "", 10);
        const remaining = !Number.isNaN(parsedRemaining) ? parsedRemaining : 0;

        const resetHeader = response.headers.get("X-RateLimit-Reset");
        const parsedReset = parseInt(resetHeader ?? "", 10);
        const resetEpoch = !Number.isNaN(parsedReset) ? parsedReset : 0;

        const resetDate = resetEpoch > 0
          ? new Date(resetEpoch * 1000)
          : new Date(Date.now() + retryAfter * 1000);

        throw new RateLimitError(
          errorMessage ?? "Rate limit exceeded",
          retryAfter,
          remaining,
          resetDate,
        );
      }

      if (response.status === 400) {
        throw new BadRequestError(errorMessage ?? "Bad search request");
      }
      if (response.status === 401) {
        throw new AuthenticationError(errorMessage ?? "Authentication failed");
      }
      if (response.status === 403) {
        throw new ForbiddenError(errorMessage ?? "Access denied", "unknown");
      }
      if (response.status === 404) {
        throw new NotFoundError(errorMessage ?? "Search endpoint not found", "");
      }
      throw new LogoError(errorMessage ?? "Search request failed", "SERVER_ERROR", response.status);
    }

    // Response size is bounded by the server's limit cap (max 100 results)
    // No additional client-side size guard needed.
    // Wrap json() so that a non-JSON 200 body (e.g. an HTML error page) throws
    // a typed LogoError instead of leaking an untyped SyntaxError.
    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      throw new LogoError("Invalid response body", "SERVER_ERROR");
    }

    if (!isSearchResponse(raw)) {
      throw new LogoError("Invalid search response shape", "SERVER_ERROR");
    }

    return raw;
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}
