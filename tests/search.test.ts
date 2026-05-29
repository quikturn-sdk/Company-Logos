import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { searchLogos, _resetSearchInflightForTesting } from "../src/search";
import { RateLimitError, BadRequestError, LogoError, AuthenticationError, ForbiddenError, NotFoundError } from "../src/errors";
import type { SearchResponse } from "../src/search-types";

// ---------------------------------------------------------------------------
// Phase 2 - searchLogos() Client Function (Tasks 12-13)
//
// All tests mock globalThis.fetch via vi.fn(). The search function uses raw
// fetch (no Authorization header) and passes the token as a query parameter.
// ---------------------------------------------------------------------------

/**
 * Helper: creates a minimal valid 200 OK mock Response with a valid SearchResponse body.
 */
function mockOkResponse(): Response {
  return mockResponse(200, {}, makeSearchResponse());
}

/**
 * Helper: creates a minimal mock Response with the given status, headers, and
 * optional JSON body. Mirrors the pattern used in fetcher.test.ts.
 */
function mockResponse(
  status: number,
  headers: Record<string, string> = {},
  body: unknown = null,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: () => Promise.resolve(body),
    text: async () => (body ? JSON.stringify(body) : ""),
  } as unknown as Response;
}

/** Minimal valid SearchResponse fixture. */
function makeSearchResponse(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    query: "github",
    mode: "autocomplete",
    page: 1,
    limit: 10,
    total: 1,
    cache: { status: "miss", ttlSeconds: 60, version: "1" },
    results: [
      {
        domain: "github.com",
        name: "GitHub",
        logoUrl: "https://logos.getquikturn.io/github.com",
        logoApiUrl: "https://logos.getquikturn.io/github.com",
        confidence: 1.0,
        source: "manual",
        reviewState: "approved",
      },
    ],
    ...overrides,
  };
}

describe("searchLogos", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    // Clear module-level inflight dedup map to prevent test cross-contamination
    _resetSearchInflightForTesting();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // T12.1 — Calls GET /v1/search with correct query params
  // -----------------------------------------------------------------------

  it("T12.1 - calls GET /v1/search with q, mode, page, limit, and token params", async () => {
    const responseBody = makeSearchResponse();
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, responseBody));

    await searchLogos({ q: "github", mode: "autocomplete", token: "qt_test", page: 1, limit: 10 });

    expect(fetchSpy).toHaveBeenCalledOnce();

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);

    expect(parsedUrl.pathname).toBe("/v1/search");
    expect(parsedUrl.searchParams.get("q")).toBe("github");
    expect(parsedUrl.searchParams.get("mode")).toBe("autocomplete");
    expect(parsedUrl.searchParams.get("page")).toBe("1");
    expect(parsedUrl.searchParams.get("limit")).toBe("10");
    expect(parsedUrl.searchParams.get("token")).toBe("qt_test");
  });

  // -----------------------------------------------------------------------
  // T12.2 — Default limit for autocomplete is 10
  // -----------------------------------------------------------------------

  it("T12.2 - uses default limit of 10 for autocomplete mode", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "acme" });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);

    expect(parsedUrl.searchParams.get("mode")).toBe("autocomplete");
    expect(parsedUrl.searchParams.get("limit")).toBe("10");
  });

  // -----------------------------------------------------------------------
  // T12.3 — Default limit for search mode is 25
  // -----------------------------------------------------------------------

  it("T12.3 - uses default limit of 25 for search mode", async () => {
    fetchSpy.mockResolvedValueOnce(
      mockResponse(200, {}, makeSearchResponse({ mode: "search", limit: 25 })),
    );

    await searchLogos({ q: "acme", mode: "search" });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);

    expect(parsedUrl.searchParams.get("mode")).toBe("search");
    expect(parsedUrl.searchParams.get("limit")).toBe("25");
  });

  // -----------------------------------------------------------------------
  // T12.4 — Allows baseUrl override for staging
  // -----------------------------------------------------------------------

  it("T12.4 - uses baseUrl override when provided", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "acme", baseUrl: "https://staging.logos.example.com" });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    expect(calledUrl).toMatch(/^https:\/\/staging\.logos\.example\.com\/v1\/search/);
  });

  // -----------------------------------------------------------------------
  // T12.5 — Applies filter params as filter[key]=value
  // -----------------------------------------------------------------------

  it("T12.5 - serializes filters as filter[key]=value query params", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({
      q: "acme",
      filters: { industry: "tech", hasLogo: true, reviewState: "approved" },
    });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);

    expect(parsedUrl.searchParams.get("filter[industry]")).toBe("tech");
    expect(parsedUrl.searchParams.get("filter[hasLogo]")).toBe("true");
    expect(parsedUrl.searchParams.get("filter[reviewState]")).toBe("approved");
  });

  // -----------------------------------------------------------------------
  // T12.6 — Throws RateLimitError on 429
  // -----------------------------------------------------------------------

  it("T12.6 - throws RateLimitError on 429 response", async () => {
    fetchSpy.mockResolvedValueOnce(
      mockResponse(429, {
        "Retry-After": "30",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1700000060",
      }),
    );

    await expect(searchLogos({ q: "github" })).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(RateLimitError);
      const rateLimitErr = err as RateLimitError;
      expect(rateLimitErr.retryAfter).toBe(30);
      expect(rateLimitErr.remaining).toBe(0);
      expect(rateLimitErr.code).toBe("RATE_LIMIT_ERROR");
      return true;
    });
  });

  // -----------------------------------------------------------------------
  // T12.7 — Returns empty results on 200 with no hits
  // -----------------------------------------------------------------------

  it("T12.7 - returns empty results array on 200 with no hits", async () => {
    const emptyResponse = makeSearchResponse({ results: [], total: 0 });
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, emptyResponse));

    const result = await searchLogos({ q: "zzznomatch" });

    expect(result.results).toEqual([]);
    expect(result.total).toBe(0);
  });

  // -----------------------------------------------------------------------
  // T12.8 — Returns the full SearchResponse envelope
  // -----------------------------------------------------------------------

  it("T12.8 - returns the full SearchResponse envelope from the API", async () => {
    const body = makeSearchResponse();
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, body));

    const result = await searchLogos({ q: "github", token: "qt_test" });

    expect(result.query).toBe("github");
    expect(result.mode).toBe("autocomplete");
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.cache.status).toBe("miss");
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.domain).toBe("github.com");
  });

  // -----------------------------------------------------------------------
  // T12.9 — Throws LogoError subclass on non-429 non-OK responses
  // -----------------------------------------------------------------------

  it("T12.9 - throws LogoError on non-OK non-429 response (500)", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(500));

    await expect(searchLogos({ q: "github" })).rejects.toBeInstanceOf(LogoError);
  });

  it("T12.9b - throws BadRequestError on 400 response", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(400));

    await expect(searchLogos({ q: "github" })).rejects.toBeInstanceOf(BadRequestError);
  });

  // -----------------------------------------------------------------------
  // T12.10 — sort param is forwarded when provided
  // -----------------------------------------------------------------------

  it("T12.10 - forwards sort param when provided", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "acme", sort: "name:asc" });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);

    expect(parsedUrl.searchParams.get("sort")).toBe("name:asc");
  });

  // -----------------------------------------------------------------------
  // T12.11 — Default base URL is logos.getquikturn.io
  // -----------------------------------------------------------------------

  it("T12.11 - uses the default base URL when baseUrl is not provided", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "acme" });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    expect(calledUrl).toMatch(/^https:\/\/logos\.getquikturn\.io\/v1\/search/);
  });

  // -----------------------------------------------------------------------
  // T12.12 — Limit is capped at 20 for autocomplete mode
  // -----------------------------------------------------------------------

  it("T12.12 - caps limit at 20 for autocomplete mode", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "acme", mode: "autocomplete", limit: 999 });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);

    expect(parsedUrl.searchParams.get("limit")).toBe("20");
  });

  // -----------------------------------------------------------------------
  // T12.13 — Limit is capped at 100 for search mode
  // -----------------------------------------------------------------------

  it("T12.13 - caps limit at 100 for search mode", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse({ mode: "search" })));

    await searchLogos({ q: "acme", mode: "search", limit: 500 });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);

    expect(parsedUrl.searchParams.get("limit")).toBe("100");
  });

  // -----------------------------------------------------------------------
  // T12.14 — Explicit limit below cap is preserved
  // -----------------------------------------------------------------------

  it("T12.14 - preserves explicit limit when it is below the cap", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse({ mode: "search" })));

    await searchLogos({ q: "acme", mode: "search", limit: 5 });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);

    expect(parsedUrl.searchParams.get("limit")).toBe("5");
  });

  // -----------------------------------------------------------------------
  // T12.15 — Concurrent identical calls share one in-flight fetch
  // -----------------------------------------------------------------------

  it("T12.15 - deduplicates concurrent calls with identical URLs", async () => {
    // Use a unique query to avoid collision with other tests' inflight entries
    const body = makeSearchResponse({ query: "dedup-test" });
    // Only one response is queued — if fetch is called twice the second would get undefined
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, body));

    const [r1, r2] = await Promise.all([
      searchLogos({ q: "dedup-test", baseUrl: "https://logos.getquikturn.io" }),
      searchLogos({ q: "dedup-test", baseUrl: "https://logos.getquikturn.io" }),
    ]);

    // fetch should only have been called once
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(r1).toBe(r2);
  });

  // -----------------------------------------------------------------------
  // T12.16 — SearchResult.name may be null (nullable name)
  // -----------------------------------------------------------------------

  it("T12.16 - accepts SearchResult with null name", async () => {
    const body = makeSearchResponse({
      results: [
        {
          domain: "unknown.com",
          name: null,
          logoUrl: null,
          logoApiUrl: "https://logos.getquikturn.io/unknown.com",
          confidence: 0.5,
          source: "crawl",
          reviewState: "pending",
        },
      ],
    });
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, body));

    const result = await searchLogos({ q: "unknown" });

    expect(result.results[0]?.name).toBeNull();
  });

  // -----------------------------------------------------------------------
  // T12.17 — Uses default retry-after when Retry-After header is missing
  // -----------------------------------------------------------------------

  it("T12.17 - uses default retry-after when Retry-After header is absent on 429", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(429, {}));

    await expect(searchLogos({ q: "missing-header-test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => {
        expect(err).toBeInstanceOf(RateLimitError);
        // Default is 60 seconds
        expect((err as RateLimitError).retryAfter).toBe(60);
        return true;
      },
    );
  });

  // -----------------------------------------------------------------------
  // T12.18 — Retry-After: 0 is treated as immediate retry (not fallback)
  // -----------------------------------------------------------------------

  it("T12.18 - respects Retry-After: 0 as immediate retry (retryAfter === 0)", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(429, { "Retry-After": "0" }));

    await expect(searchLogos({ q: "zero-retry-test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(0);
        return true;
      },
    );
  });

  // -----------------------------------------------------------------------
  // T12.19 — Throws on network failure
  // -----------------------------------------------------------------------

  it("T12.19 - wraps network errors as LogoError with NETWORK_ERROR code", async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(
      searchLogos({ q: "network-error-test", token: "pk_test" }),
    ).rejects.toSatisfy((err: unknown) => {
      return err instanceof LogoError && err.code === "NETWORK_ERROR";
    });
  });

  // -----------------------------------------------------------------------
  // T12.20 — Cleans up inflight map after error so second call retries
  // -----------------------------------------------------------------------

  it("T12.20 - cleans up inflight map after error so a subsequent call retries", async () => {
    const uniqueQ = "cleanup-inflight-test";
    fetchSpy.mockRejectedValueOnce(new Error("network"));

    // First call fails
    try {
      await searchLogos({ q: uniqueQ, token: "pk_test" });
    } catch {
      // expected
    }

    // Second call should issue a fresh fetch (inflight entry was removed)
    const body = makeSearchResponse({ query: uniqueQ });
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, body));

    const result = await searchLogos({ q: uniqueQ, token: "pk_test" });
    expect(result.results).toBeDefined();
    // fetch should have been called twice total
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  // -----------------------------------------------------------------------
  // T12.21 — AbortSignal is passed through to fetch
  // -----------------------------------------------------------------------

  it("T12.21 - passes AbortSignal to fetch when provided", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    const controller = new AbortController();
    await searchLogos({ q: "signal-test", signal: controller.signal });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [_url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(init?.signal).toBe(controller.signal);
  });

  // -----------------------------------------------------------------------
  // T12.22 — AbortError is NOT swallowed by the network error wrapper
  // -----------------------------------------------------------------------

  it("T12.22 - rethrows AbortError without wrapping it in LogoError", async () => {
    const abortError = new Error("The operation was aborted.");
    abortError.name = "AbortError";
    fetchSpy.mockRejectedValueOnce(abortError);

    const controller = new AbortController();
    controller.abort();

    await expect(
      searchLogos({ q: "abort-test", signal: controller.signal }),
    ).rejects.toSatisfy((err: unknown) => {
      // Must NOT be wrapped in LogoError
      expect(err).not.toBeInstanceOf(LogoError);
      expect((err as Error).name).toBe("AbortError");
      return true;
    });
  });

  // -----------------------------------------------------------------------
  // T12.23 — NaN and Infinity are sanitized for page and limit
  // -----------------------------------------------------------------------

  it("T12.23 - falls back to default page when page is NaN", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "nan-page-test", page: NaN });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);
    expect(parsedUrl.searchParams.get("page")).toBe("1");
  });

  it("T12.23b - falls back to default limit when limit is Infinity", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "inf-limit-test", limit: Infinity });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);
    // Should use the default autocomplete limit, not "Infinity"
    expect(parsedUrl.searchParams.get("limit")).toBe("10");
  });

  it("T12.23c - falls back to default limit when limit is NaN", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "nan-limit-test", limit: NaN });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);
    expect(parsedUrl.searchParams.get("limit")).toBe("10");
  });

  // -----------------------------------------------------------------------
  // T12.24 — JSON parse failure is wrapped in a typed LogoError
  // -----------------------------------------------------------------------

  it("T12.24 - wraps SyntaxError from response.json() into LogoError SERVER_ERROR", async () => {
    const badResponse = {
      ok: true,
      status: 200,
      headers: new Headers(),
      json: () => Promise.reject(new SyntaxError("Unexpected token < in JSON")),
    } as unknown as Response;
    fetchSpy.mockResolvedValueOnce(badResponse);

    await expect(searchLogos({ q: "bad-json-test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => {
        expect(err).toBeInstanceOf(LogoError);
        expect((err as LogoError).code).toBe("SERVER_ERROR");
        return true;
      },
    );
  });

  // -----------------------------------------------------------------------
  // T12.25 — Trailing-slash stripping on baseUrl
  // -----------------------------------------------------------------------

  it("T12.25 - strips multiple trailing slashes from baseUrl", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "test", token: "pk_test", baseUrl: "https://host///" });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("https://host/v1/search");
    expect(url).not.toContain("///");
  });

  it("T12.25b - handles baseUrl without trailing slash", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "test", token: "pk_test", baseUrl: "https://host" });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("https://host/v1/search");
  });

  // -----------------------------------------------------------------------
  // T12.26 — HTTP 401, 403, 404 throw typed errors
  // -----------------------------------------------------------------------

  it("T12.26 - throws AuthenticationError on 401", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(401));

    await expect(
      searchLogos({ q: "test", token: "pk_test" }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("T12.26b - throws ForbiddenError on 403", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(403));

    await expect(
      searchLogos({ q: "test", token: "pk_test" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("T12.26c - throws NotFoundError on 404", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(404));

    await expect(
      searchLogos({ q: "test", token: "pk_test" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  // -----------------------------------------------------------------------
  // T12.27 — Limit floor: non-positive values are clamped to 1
  // -----------------------------------------------------------------------

  it("T12.27 - clamps limit: -1 to a minimum of 1", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "floor-test", limit: -1 });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);
    expect(parsedUrl.searchParams.get("limit")).toBe("1");
  });

  it("T12.27b - clamps limit: 0 to a minimum of 1", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "zero-limit-test", limit: 0 });

    const calledUrl: string = fetchSpy.mock.calls[0]?.[0] as string;
    const parsedUrl = new URL(calledUrl);
    expect(parsedUrl.searchParams.get("limit")).toBe("1");
  });

  // -----------------------------------------------------------------------
  // T12.28 — baseUrl with a path component resolves /v1/search correctly
  // -----------------------------------------------------------------------

  it("T12.28 - preserves baseUrl path component when resolving v1/search", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(200, {}, makeSearchResponse()));

    await searchLogos({ q: "test", token: "pk_test", baseUrl: "https://host/api" });

    const [calledUrl] = fetchSpy.mock.calls[0] as [string];
    const parsedUrl = new URL(calledUrl);
    expect(parsedUrl.hostname).toBe("host");
    // Path component "/api" must be preserved — leading slash would silently discard it
    expect(parsedUrl.pathname).toBe("/api/v1/search");
    expect(parsedUrl.searchParams.get("q")).toBe("test");
  });

  // -----------------------------------------------------------------------
  // T12.29 — Non-conforming 200 response shape throws SERVER_ERROR
  // -----------------------------------------------------------------------

  it("T12.29 - throws LogoError SERVER_ERROR on malformed 200 response shape", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ foo: "bar" }),  // missing results and total
    });
    await expect(searchLogos({ q: "test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => err instanceof LogoError && (err as LogoError).code === "SERVER_ERROR"
    );
  });

  // -----------------------------------------------------------------------
  // T12.30 — Server-provided error message extraction
  // -----------------------------------------------------------------------

  it("T12.30 - extracts message from 400 response body", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers(),
      text: async () => JSON.stringify({ message: "Invalid filter syntax" }),
      body: null,
    });
    await expect(searchLogos({ q: "test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => err instanceof BadRequestError && (err as BadRequestError).message.includes("Invalid filter syntax")
    );
  });

  it("T12.30b - falls back to error field when message is absent", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers(),
      text: async () => JSON.stringify({ error: "Bad request" }),
      body: null,
    });
    await expect(searchLogos({ q: "test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => err instanceof BadRequestError && (err as BadRequestError).message.includes("Bad request")
    );
  });

  // -----------------------------------------------------------------------
  // T12.31 — baseUrl with trailing slash preserves base path
  // -----------------------------------------------------------------------

  it("T12.31 - preserves base path with trailing slash", async () => {
    fetchSpy.mockResolvedValueOnce(mockOkResponse());
    await searchLogos({ q: "test", token: "pk_test", baseUrl: "https://host/api/" });
    const [url] = fetchSpy.mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/api/v1/search");
  });

  // -----------------------------------------------------------------------
  // T12.32 — Malformed baseUrl throws LogoError
  // -----------------------------------------------------------------------

  it("T12.32 - throws BadRequestError on malformed baseUrl", async () => {
    await expect(searchLogos({ q: "test", token: "pk_test", baseUrl: "not-a-url" }))
      .rejects.toBeInstanceOf(BadRequestError);
  });

  // -----------------------------------------------------------------------
  // T12.33 — isSearchResponse rejects results array with null or invalid items
  // -----------------------------------------------------------------------

  it("T12.33 - throws SERVER_ERROR when results contains null as first item", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ results: [null], total: 1 }),
    });
    await expect(searchLogos({ q: "test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => err instanceof LogoError && (err as LogoError).code === "SERVER_ERROR"
    );
  });

  it("T12.33b - throws SERVER_ERROR when results first item has no domain field", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ results: [{ foo: "bar" }], total: 1 }),
    });
    await expect(searchLogos({ q: "test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => err instanceof LogoError && (err as LogoError).code === "SERVER_ERROR"
    );
  });

  // -----------------------------------------------------------------------
  // T12.34 — isSearchResponse rejects results missing logoApiUrl
  // Note: inflight ceiling bypass (MAX_INFLIGHT=1000) is not directly testable
  // since _inflight is module-private. See JSDoc on _inflight for design.
  // -----------------------------------------------------------------------

  it("T12.34 - throws SERVER_ERROR when results first item is missing logoApiUrl", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ results: [{ domain: "x.com" }], total: 1 }),
    });
    await expect(searchLogos({ q: "test", token: "pk_test" })).rejects.toSatisfy(
      (err: unknown) => err instanceof LogoError && (err as LogoError).code === "SERVER_ERROR"
    );
  });
});
