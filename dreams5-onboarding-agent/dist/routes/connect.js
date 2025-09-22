import { encryptJSON } from '../lib/crypto';
const impl = {
    async store(request, env) {
        const raw = await request.json().catch(() => ({}));
        const { tenantId, service, payload } = raw;
        if (!tenantId || !service) {
            return new Response(JSON.stringify({ error: 'tenantId and service required' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        const secret = env.SECRET_KEY || 'dev-secret';
        try {
            const b64 = await encryptJSON(payload ?? {}, secret);
            const key = `secrets:${tenantId}:${service}`;
            await env.KV_CONFIG.put(key, b64);
            if (env.DB) {
                const id = `${tenantId}:connect-${service}:${Date.now()}`;
                await env.DB.prepare('INSERT INTO steps (id, tenant_id, step_key, status, data) VALUES (?, ?, ?, ?, ?)')
                    .run(id, tenantId, `connect-${service}`, 'stored', JSON.stringify({ storedAt: Date.now() }));
            }
            return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
        }
        catch (err) {
            return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
        }
    }
};
export async function handle(request, env) {
    if (request.method === 'POST')
        return impl.store(request, env);
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
}
