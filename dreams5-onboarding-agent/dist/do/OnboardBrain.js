export class OnboardBrain {
    state;
    env;
    constructor(state, env) {
        this.state = state;
        this.env = env;
    }
    async fetch(request) {
        const url = new URL(request.url);
        if (request.method === 'GET' && url.pathname === '/state') {
            const stored = await this.state.storage.get('state');
            return new Response(JSON.stringify({ state: stored ? JSON.parse(stored) : {} }), { headers: { 'content-type': 'application/json' } });
        }
        if (request.method === 'POST' && url.pathname === '/state') {
            const body = await request.json().catch(() => ({}));
            await this.state.storage.put('state', JSON.stringify(body));
            return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
        }
        return new Response('not found', { status: 404 });
    }
}
