export default {
    async check(request) {
        return new Response(JSON.stringify({ greenlight: true }), { headers: { 'content-type': 'application/json' } });
    }
};
