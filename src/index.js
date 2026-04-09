export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, url);
    }
    if (url.pathname.startsWith('/photos/')) {
      return servePhoto(request, env, url);
    }
    return env.ASSETS.fetch(request);
  }
};

function isAuthorized(request, env) {
  const auth = request.headers.get('Authorization');
  return auth === `Bearer ${env.ADMIN_PASSWORD}`;
}

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

async function handleAPI(request, env, url) {
  // ── AUTH CHECK ──
  if (url.pathname === '/api/auth' && request.method === 'GET') {
    return isAuthorized(request, env)
      ? new Response('OK', { status: 200 })
      : new Response('Unauthorized', { status: 401 });
  }

  // ── CLASSES ──
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

  // ── PHOTOS ──
  if (url.pathname === '/api/photos/approved' && request.method === 'GET') {
    const data = await loadPhotos(env);
    return new Response(JSON.stringify({ approved: data.approved }), { headers: JSON_HEADERS });
  }

  if (url.pathname === '/api/photos/all' && request.method === 'GET') {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 });
    }
    const data = await loadPhotos(env);
    return new Response(JSON.stringify(data), { headers: JSON_HEADERS });
  }

  if (url.pathname === '/api/photos/upload' && request.method === 'POST') {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return new Response('No file provided', { status: 400 });
    }
    // Enforce size limit (25MB)
    if (file.size > 25 * 1024 * 1024) {
      return new Response('File too large (25MB max)', { status: 413 });
    }
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const ext = getExtension(file.name);
    const key = `${id}${ext}`;

    const buf = await file.arrayBuffer();
    await env.PHOTOS.put(key, buf, {
      httpMetadata: { contentType: file.type || 'image/jpeg' }
    });

    const data = await loadPhotos(env);
    data.pending.push({
      id,
      name: file.name,
      key,
      submitted: new Date().toISOString()
    });
    await savePhotos(env, data);

    return new Response(JSON.stringify({ success: true, id }), { headers: JSON_HEADERS });
  }

  if (url.pathname === '/api/photos/approve' && request.method === 'POST') {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await request.json();
    const data = await loadPhotos(env);
    const photo = data.pending.find(p => p.id === body.id);
    if (!photo) return new Response('Not Found', { status: 404 });
    data.pending = data.pending.filter(p => p.id !== body.id);
    data.approved.push({ ...photo, approved: new Date().toISOString(), caption: body.caption || '' });
    await savePhotos(env, data);
    return new Response('OK');
  }

  if (url.pathname === '/api/photos/decline' && request.method === 'POST') {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await request.json();
    const data = await loadPhotos(env);
    const photo = data.pending.find(p => p.id === body.id);
    if (!photo) return new Response('Not Found', { status: 404 });
    data.pending = data.pending.filter(p => p.id !== body.id);
    await savePhotos(env, data);
    try { await env.PHOTOS.delete(photo.key); } catch {}
    return new Response('OK');
  }

  if (url.pathname === '/api/photos/delete' && request.method === 'POST') {
    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await request.json();
    const data = await loadPhotos(env);
    const photo = data.approved.find(p => p.id === body.id);
    if (!photo) return new Response('Not Found', { status: 404 });
    data.approved = data.approved.filter(p => p.id !== body.id);
    await savePhotos(env, data);
    try { await env.PHOTOS.delete(photo.key); } catch {}
    return new Response('OK');
  }

  return new Response('Not Found', { status: 404 });
}

async function servePhoto(request, env, url) {
  const key = decodeURIComponent(url.pathname.replace('/photos/', ''));
  if (!key) return new Response('Not Found', { status: 404 });
  const obj = await env.PHOTOS.get(key);
  if (!obj) return new Response('Not Found', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': obj.httpEtag
    }
  });
}

async function loadPhotos(env) {
  const data = await env.TNR_CLASSES.get('photos');
  if (!data) return { pending: [], approved: [] };
  try {
    const parsed = JSON.parse(data);
    return {
      pending: parsed.pending || [],
      approved: parsed.approved || []
    };
  } catch {
    return { pending: [], approved: [] };
  }
}

async function savePhotos(env, data) {
  await env.TNR_CLASSES.put('photos', JSON.stringify(data));
}

function getExtension(filename) {
  const m = filename.match(/\.[^.]+$/);
  return m ? m[0].toLowerCase() : '.jpg';
}
