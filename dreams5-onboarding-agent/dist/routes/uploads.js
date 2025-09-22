import { UploadRequestSchema } from '../lib/schemas';
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}
const impl = {
    async create(request, env, url) {
        const raw = await request.json().catch(() => ({}));
        const parsed = UploadRequestSchema.safeParse(raw);
        if (!parsed.success) {
            return new Response(JSON.stringify({ error: 'validation', issues: parsed.error.format() }), {
                status: 422,
                headers: { 'content-type': 'application/json' }
            });
        }
        const body = parsed.data;
        const key = `uploads/${Date.now()}-${body.filename || 'file'}`;
        const storageKey = env.R2_ASSETS ? key : `kv:${key}`;
        try {
            await env.DB.prepare('INSERT INTO uploads (id, tenant_id, filename, r2_key) VALUES (?, ?, ?, ?)')
                .run(key, body.tenantId || null, body.filename || null, storageKey);
            if (env.R2_ASSETS) {
                const signed = await env.R2_ASSETS.createPresignedUrl?.({ method: 'PUT', key, expiration: 600 });
                return new Response(JSON.stringify({ uploadUrl: signed, key }), {
                    headers: { 'content-type': 'application/json' }
                });
            }
            const token = crypto.randomUUID();
            await env.KV_CONFIG.put(`upload:pending:${token}`, JSON.stringify({ key, tenantId: body.tenantId || null, filename: body.filename || null, type: body.type || null }), { expirationTtl: 600 });
            const directUrl = new URL('/api/upload/direct', url.origin);
            directUrl.searchParams.set('token', token);
            return new Response(JSON.stringify({ uploadUrl: directUrl.toString(), key, storage: 'kv' }), {
                headers: { 'content-type': 'application/json' }
            });
        }
        catch (err) {
            return new Response(JSON.stringify({ error: String(err) }), {
                status: 500,
                headers: { 'content-type': 'application/json' }
            });
        }
    },
    async directUpload(request, env, url) {
        const token = url.searchParams.get('token');
        if (!token) {
            return new Response(JSON.stringify({ error: 'missing token' }), {
                status: 400,
                headers: { 'content-type': 'application/json' }
            });
        }
        const meta = await env.KV_CONFIG.get(`upload:pending:${token}`, 'json');
        if (!meta) {
            return new Response(JSON.stringify({ error: 'upload not found or expired' }), {
                status: 404,
                headers: { 'content-type': 'application/json' }
            });
        }
        const data = await request.arrayBuffer().catch(() => null);
        if (!data || data.byteLength === 0) {
            return new Response(JSON.stringify({ error: 'empty payload' }), {
                status: 400,
                headers: { 'content-type': 'application/json' }
            });
        }
        const base64 = arrayBufferToBase64(data);
        const type = request.headers.get('content-type') || meta.type || 'application/octet-stream';
        await env.KV_CONFIG.put(`upload:data:${meta.key}`, JSON.stringify({ data: base64, type, filename: meta.filename }), {
            expirationTtl: 60 * 60 * 24 * 30
        });
        await env.DB.prepare('UPDATE uploads SET uploaded_at = CURRENT_TIMESTAMP WHERE id = ?').run(meta.key);
        await env.KV_CONFIG.delete(`upload:pending:${token}`);
        return new Response(JSON.stringify({ stored: meta.key }), {
            headers: { 'content-type': 'application/json' }
        });
    }
};
export async function handle(request, env) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/upload') {
        return impl.create(request, env, url);
    }
    if (request.method === 'PUT' && url.pathname === '/api/upload/direct') {
        return impl.directUpload(request, env, url);
    }
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json' }
    });
}
