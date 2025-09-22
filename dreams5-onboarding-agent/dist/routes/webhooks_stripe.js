import { getConfig } from '../lib/kv';
function getTenantId(evt) {
    try {
        if (evt?.data?.object?.metadata?.tenant_id)
            return String(evt.data.object.metadata.tenant_id);
        if (evt?.data?.object?.metadata?.tenantId)
            return String(evt.data.object.metadata.tenantId);
        if (evt?.tenantId)
            return String(evt.tenantId);
    }
    catch { }
    return undefined;
}
export async function handle(request, env) {
    // In production, verify Stripe signature using STRIPE_WEBHOOK_SECRET.
    const evt = await request.json().catch(() => ({}));
    const tenantId = getTenantId(evt);
    if (!tenantId)
        return new Response(JSON.stringify({ ok: false, error: 'missing tenant id' }), { status: 400, headers: { 'content-type': 'application/json' } });
    const type = evt?.type || 'unknown';
    try {
        // Mark payment received
        const payId = `${tenantId}:payment:${Date.now()}`;
        await env.DB.prepare('INSERT INTO steps (id, tenant_id, step_key, status, data) VALUES (?, ?, ?, ?, ?)')
            .run(payId, tenantId, 'payment', (type.includes('succeeded') || type.includes('completed')) ? 'succeeded' : 'received', JSON.stringify({ type }));
        // Seed required steps as pending
        const cfg = await getConfig(env.KV_CONFIG).catch(() => null);
        const steps = cfg?.steps?.map((s) => s.key) || ['setup-domain', 'connect-ga4'];
        for (const key of steps) {
            const id = `${tenantId}:${key}:seed:${Date.now()}`;
            await env.DB.prepare('INSERT INTO steps (id, tenant_id, step_key, status, data) VALUES (?, ?, ?, ?, ?)')
                .run(id, tenantId, key, 'pending', JSON.stringify({ seededBy: 'stripe' }));
        }
        return new Response(JSON.stringify({ ok: true, tenantId, type }), { headers: { 'content-type': 'application/json' } });
    }
    catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
}
