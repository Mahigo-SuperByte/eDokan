/**
 * EdgeOne Makers Edge Function: GET /api/scratch-search
 * Same-site Scratch proxy using the EdgeOne Makers edge-functions route directory and a strict CORS allowlist.
 * Same-origin frontend requests do not need CORS, but the headers also allow
 * the BhorOS site to call this endpoint if that cross-site integration is used.
 */
const ALLOWED_ORIGINS = new Set([
  'https://sonarbangla-edokan.edgeone.dev',
  'https://sonarbangla-bhor-os.edgeone.dev'
]);

export async function onRequestOptions(context) {
  const headers = corsHeaders(context.request);
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(null, { status: 204, headers });
}

export async function onRequestGet(context) {
  const request = context.request;
  const url = new URL(request.url);
  const params = url.searchParams;

  const query = (params.get('q') || 'trending').trim().slice(0, 100) || 'trending';
  const languageCandidate = (params.get('language') || 'en').trim();
  const language = /^[a-z]{2}(?:-[A-Z]{2})?$/.test(languageCandidate)
    ? languageCandidate
    : 'en';
  const acceptedModes = new Set(['trending', 'popular', 'recent']);
  const requestedMode = (params.get('mode') || 'trending').trim().toLowerCase();
  const mode = acceptedModes.has(requestedMode) ? requestedMode : 'trending';
  const rawLimit = Number.parseInt(params.get('limit') || '24', 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(24, Math.max(1, rawLimit)) : 24;
  const rawOffset = Number.parseInt(params.get('offset') || '0', 10);
  const offset = Number.isFinite(rawOffset) ? Math.min(200, Math.max(0, rawOffset)) : 0;

  const upstreamUrl = new URL('https://api.scratch.mit.edu/search/projects');
  upstreamUrl.search = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    language,
    mode,
    q: query
  }).toString();

  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    if (!upstream.ok) {
      return json({
        error: 'Scratch search upstream returned HTTP ' + upstream.status,
        upstreamStatus: upstream.status
      }, 502, request, { 'Cache-Control': 'no-store' });
    }

    const body = await upstream.json();
    if (!Array.isArray(body)) {
      return json({ error: 'Scratch search returned an unexpected response.' }, 502, request);
    }

    return json(body, 200, request, {
      'Cache-Control': 'public, max-age=20, s-maxage=60, stale-while-revalidate=120'
    });
  } catch (error) {
    return json({ error: 'Could not contact the Scratch search API.' }, 502, request, {
      'Cache-Control': 'no-store'
    });
  }
}

function corsHeaders(request) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Content-Type',
    'Vary': 'Origin'
  });
  const origin = request.headers.get('Origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    // Echo exactly the allowed request origin (no trailing slash).
    headers.set('Access-Control-Allow-Origin', origin);
  }
  // Do not enable credentials; the endpoint is a public project search proxy.
  return headers;
}

function json(data, status, request, extraHeaders = {}) {
  const headers = corsHeaders(request);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Content-Type-Options', 'nosniff');
  for (const [name, value] of Object.entries(extraHeaders)) {
    headers.set(name, value);
  }
  return new Response(JSON.stringify(data), { status, headers });
}
