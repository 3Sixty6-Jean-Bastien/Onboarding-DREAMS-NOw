export default {
    async create(request) {
        const body = await request.json().catch(() => ({}));
        const key = `uploads/${Date.now()}-${body.filename || 'file'}`;
        try {
            // generate a pseudo-signed URL (R2 SDK would be used in real code)
            const url = `https://${request.env?.R2_BUCKET || 'r2'}.example/${encodeURIComponent(key)}`;
            if (request.env?.DB) {
                await request.env.DB.prepare('INSERT INTO uploads (id, tenant_id, filename, r2_key) VALUES (?, ?, ?, ?)').run(key, body.tenant_id || null, body.filename || null, key);
            }
            return new Response(JSON.stringify({ uploadUrl: url, key }), { headers: { 'content-type': 'application/json' } });
        }
        catch (err) {
            return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
        }
    }
};
