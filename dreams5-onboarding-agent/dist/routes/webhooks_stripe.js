export default {
    async handle(request) {
        // minimal webhook echo
        const body = await request.text();
        return new Response(JSON.stringify({ received: body }), { headers: { 'content-type': 'application/json' } });
    }
};
