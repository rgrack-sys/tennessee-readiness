export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, url);
    }
    return env.ASSETS.fetch(request);
  }
};

function isAuthorized(request, env) {
  const auth = request.headers.get('Authorization');
  return auth === `Bearer ${env.ADMIN_PASSWORD}`;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function handleAPI(request, env, url) {
  // Auth check endpoint
  if (url.pathname === '/api/auth' && request.method === 'GET') {
    return isAuthorized(request, env)
      ? new Response('OK', { status: 200 })
      : new Response('Unauthorized', { status: 401 });
  }

  // Classes endpoint
  if (url.pathname === '/api/classes') {
    if (request.method === 'GET') {
      const data = await env.TNR_CLASSES.get('classes');
      return new Response(data || '[]', { headers: JSON_HEADERS });
    }

    if (request.method === 'POST') {
      if (!isAuthorized(request, env)) {
        return new Response('Unauthorized', { status: 401 });
      }
      const body = await request.text();
      try { JSON.parse(body); } catch {
        return new Response('Bad Request', { status: 400 });
      }
      await env.TNR_CLASSES.put('classes', body);
      return new Response('OK', { headers: JSON_HEADERS });
    }
  }

  return new Response('Not Found', { status: 404 });
}
