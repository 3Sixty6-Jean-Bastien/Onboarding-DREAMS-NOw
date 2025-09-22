export default {
    async list(request, env) {
        try {
            const res = await env.DB.prepare('SELECT * FROM steps ORDER BY updated_at DESC LIMIT 100').all();
            return new Response(JSON.stringify({ steps: res.results || [] }), { headers: { 'content-type': 'application/json' } });
        }
        catch (err) {
            return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
        }
    },
    async update(request, env) {
        const url = new URL(request.url);
        const match = url.pathname.match(/\/api\/steps\/(.+)$/);
        const stepKey = match ? match[1] : undefined;
        const body = await request.json().catch(() => ({}));
        if (!stepKey)
            return new Response(JSON.stringify({ error: 'missing step key' }), { status: 400, headers: { 'content-type': 'application/json' } });
        try {
            const id = body.id || `${stepKey}-${Date.now()}`;
            await env.DB.prepare('INSERT INTO steps (id, tenant_id, step_key, status, data) VALUES (?, ?, ?, ?, ?)').run(id, body.tenant_id || null, stepKey, body.status || null, JSON.stringify(body.data || {}));
            return new Response(JSON.stringify({ step: id, key: stepKey }), { headers: { 'content-type': 'application/json' } });
        }
        catch (err) {
            return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
        }
    }
};
