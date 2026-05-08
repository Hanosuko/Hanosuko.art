export const config = { runtime: 'edge' }

const ALLOWED_USERNAME = /^[A-Za-z0-9_]{2,32}$/
const UPSTREAM_BASE = 'https://cistiers.com/api/profile'

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')?.trim() ?? ''

  if (!ALLOWED_USERNAME.test(username)) {
    return jsonResponse({ error: 'invalid_username' }, 400, false)
  }

  try {
    const upstream = await fetch(`${UPSTREAM_BASE}/${encodeURIComponent(username)}`, {
      headers: { accept: 'application/json' },
    })

    if (!upstream.ok) {
      return jsonResponse({ error: 'upstream_failed', status: upstream.status }, 502, false)
    }

    const payload = await upstream.json()
    return jsonResponse(payload, 200, true)
  } catch {
    return jsonResponse({ error: 'fetch_failed' }, 502, false)
  }
}

function jsonResponse(body: unknown, status: number, cache: boolean): Response {
  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
  }
  if (cache) {
    headers['cache-control'] = 'public, s-maxage=300, stale-while-revalidate=600'
  } else {
    headers['cache-control'] = 'no-store'
  }
  return new Response(JSON.stringify(body), { status, headers })
}
