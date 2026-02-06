/**
 * Shared response helpers for Platform Worker
 */

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Connection-Id',
};

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function apiResponse<T>(data: { success: boolean; data?: T; error?: { code: string; message: string; details?: unknown } }, status = 200, rateLimitHeaders?: Record<string, string>): Response {
  return json(
    {
      ...data,
      meta: {
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    },
    status,
    rateLimitHeaders || {}
  );
}
