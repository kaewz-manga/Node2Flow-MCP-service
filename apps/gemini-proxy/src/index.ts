/**
 * Gemini API Proxy Worker
 *
 * Dedicated proxy for Google's Generative Language API.
 * Uses Smart Placement to run near Google servers (US),
 * avoiding region restrictions from Thai/unsupported edges.
 */

const GOOGLE_API = 'https://generativelanguage.googleapis.com';
const GOOGLE_UPLOAD_API = 'https://generativelanguage.googleapis.com/upload';

export default {
  async fetch(request: Request): Promise<Response> {
    // Only allow POST and GET
    if (request.method !== 'GET' && request.method !== 'POST' && request.method !== 'DELETE') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ ok: true, placement: 'smart' });
    }

    // Determine target base URL
    const isUpload = url.pathname.startsWith('/upload/');
    const targetPath = isUpload ? url.pathname.replace('/upload/', '/') : url.pathname;
    const targetBase = isUpload ? GOOGLE_UPLOAD_API : GOOGLE_API;
    const targetUrl = `${targetBase}${targetPath}${url.search}`;

    // Proxy the request
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Return response with CORS headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
