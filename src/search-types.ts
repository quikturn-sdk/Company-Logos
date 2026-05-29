/**
 * @quikturn/logos SDK — Search Type Definitions
 *
 * Types for the searchLogos() function and the /v1/search endpoint.
 * This file contains only type-level constructs (no runtime code).
 */

// ---------------------------------------------------------------------------
// Search Mode & Filters
// ---------------------------------------------------------------------------

/** Controls whether the search endpoint returns autocomplete suggestions or full results. */
export type SearchMode = "autocomplete" | "search";

/**
 * Optional filters applied to narrow search results.
 *
 * @since 0.8.0
 */
export interface SearchFilters {
  companyType?: string;
  industry?: string;
  hasLogo?: boolean | string;
  // (string & {}) preserves IDE autocompletion for known literals while accepting any string
  reviewState?: "approved" | "pending" | "rejected" | (string & {});
}

// ---------------------------------------------------------------------------
// Search Request Options
// ---------------------------------------------------------------------------

/**
 * Options accepted by {@link searchLogos}.
 *
 * - `q`       — The search query string (required).
 * - `mode`    — "autocomplete" (default) or "search".
 * - `page`    — Page number for pagination. Default: 1.
 * - `limit`   — Results per page. Defaults to 10 for autocomplete, 25 for search.
 * - `filters` — Optional key/value filters applied as filter[key]=value query params.
 * - `sort`    — Optional sort field/direction string.
 * - `baseUrl` — Override the default API base URL. Useful for staging/testing.
 * - `token`   — Optional API token appended as a query param.
 *
 * @since 0.8.0
 */
export interface SearchOptions {
  q: string;
  mode?: SearchMode;
  page?: number;
  limit?: number;
  filters?: SearchFilters;
  sort?: string;
  signal?: AbortSignal;
  baseUrl?: string;
  token?: string;
}

// ---------------------------------------------------------------------------
// Search Response Types
// ---------------------------------------------------------------------------

/**
 * Cache metadata included in every search response.
 *
 * @since 0.8.0
 */
export interface SearchCacheInfo {
  status: "hit" | "miss" | "skip";
  ttlSeconds: number;
  version: string;
}

/**
 * A single logo result entry returned by the search endpoint.
 *
 * @since 0.8.0
 */
export interface SearchResult {
  domain: string;
  name: string | null;
  /** Direct CDN/image URL for this logo. Null if no logo is available. */
  logoUrl: string | null;
  /** Stable API endpoint URL for fetching logo metadata via GET /v1/logos/{domain}. */
  logoApiUrl: string;
  confidence: number;
  source: string;
  reviewState: string;
}

/**
 * The JSON envelope returned by GET /v1/search.
 *
 * - `query`   — The query string that was searched.
 * - `mode`    — The search mode used ("autocomplete" or "search").
 * - `page`    — Current page number.
 * - `limit`   — Results per page.
 * - `total`   — Total number of matching results.
 * - `cache`   — Cache metadata (hit/miss, TTL, version).
 * - `results` — Array of matching logo results.
 *
 * @since 0.8.0
 */
export interface SearchResponse {
  query: string;
  mode: SearchMode;
  page: number;
  limit: number;
  total: number;
  cache: SearchCacheInfo;
  results: SearchResult[];
}
