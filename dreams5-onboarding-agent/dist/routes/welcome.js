import { randomHex } from '../lib/crypto';
const impl = {
    async send(request, env) {
        const raw = await request.json().catch(() => ({}));
        const { tenantId, email } = raw;
        if (!tenantId)
            return new Response(JSON.stringify({ error: 'tenantId required' }), { status: 400, headers: { 'content-type': 'application/json' } });
        const token = randomHex(16);
        const link = `${new URL(request.url).origin}/start?token=${token}`;
        await env.KV_CONFIG.put(`magic:${token}`, tenantId, { expirationTtl: 60 * 60 * 24 * 7 });
        if (env.DB) {
            const id = `${tenantId}:welcome:${Date.now()}`;
            await env.DB.prepare('INSERT INTO steps (id, tenant_id, step_key, status, data) VALUES (?, ?, ?, ?, ?)')
                .run(id, tenantId, 'welcome', 'sent', JSON.stringify({ email: email || null }));
        }
        // In production, send email with provider. Here we return the link for testing.
        return new Response(JSON.stringify({ ok: true, link, email: email || null }), { headers: { 'content-type': 'application/json' } });
    }
};
export async function handle(request, env) {
    if (request.method === 'POST')
        return impl.send(request, env);
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
}
