const impl = {
    async list(request, env) {
        // simple D1 query
        try {
            const res = await env.DB.prepare("SELECT id, name, created_at FROM tenants ORDER BY created_at DESC LIMIT 100").all();
            return new Response(JSON.stringify({ tenants: res.results || [] }), { headers: { 'content-type': 'application/json' } });
        }
        catch (err) {
            return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
        }
    },
    async create(request, env) {
        const body = await request.json().catch(() => ({}));
        const id = body.id || String(Date.now());
        try {
            await env.DB.prepare('INSERT INTO tenants (id, name) VALUES (?, ?)').run(id, body.name || null);
            return new Response(JSON.stringify({ created: { id, name: body.name } }), { headers: { 'content-type': 'application/json' } });
        }
        catch (err) {
            return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
        }
    }
};
export async function handle(request, env) {
    if (request.method === 'GET')
        return impl.list(request, env);
    if (request.method === 'POST')
        return impl.create(request, env);
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
}
