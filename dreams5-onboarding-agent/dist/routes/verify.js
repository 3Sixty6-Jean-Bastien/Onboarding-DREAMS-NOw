export default {
    async enqueue(request) {
        const body = await request.json().catch(() => ({}));
        try {
            if (request.env?.VERIFY_QUEUE) {
                await request.env.VERIFY_QUEUE.send(JSON.stringify(body));
            }
            return new Response(JSON.stringify({ enqueued: body }), { headers: { 'content-type': 'application/json' } });
        }
        catch (err) {
            return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
        }
    }
};
