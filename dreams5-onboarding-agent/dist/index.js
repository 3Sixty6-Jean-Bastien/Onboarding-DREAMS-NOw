import * as tenants from './routes/tenants';
import * as steps from './routes/steps';
import * as uploads from './routes/uploads';
import * as verify from './routes/verify';
import * as greenlight from './routes/greenlight';
import * as connect from './routes/connect';
import * as webhooksStripe from './routes/webhooks_stripe';
import * as welcome from './routes/welcome';
import { json as j, notFound } from './lib/responses';
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        // API routes
        if (url.pathname.startsWith('/api/tenants'))
            return tenants.handle(request, env);
        if (url.pathname.startsWith('/api/steps'))
            return steps.handle(request, env);
        if (url.pathname.startsWith('/api/upload'))
            return uploads.handle(request, env);
        if (url.pathname.startsWith('/api/verify'))
            return verify.handle(request, env);
        if (url.pathname.startsWith('/api/connect'))
            return connect.handle(request, env);
        if (url.pathname.startsWith('/api/greenlight'))
            return greenlight.handle ? greenlight.handle(request, env) : new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
        if (url.pathname.startsWith('/webhooks/stripe'))
            return webhooksStripe.handle ? webhooksStripe.handle(request, env) : new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
        if (url.pathname.startsWith('/api/welcome'))
            return welcome.handle(request, env);
        // Static assets (index.html, styles.css, etc.)
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }
        // Minimal JSON welcome if assets not configured
        if (url.pathname === '/' && request.method === 'GET') {
            return j({ ok: true, app: env.APP_NAME || 'onboarding' });
        }
        return notFound();
    },
    async queue(batch, env) {
        const { verifyConsumer } = await import('./queues/verify-consumer');
        await verifyConsumer(batch, env);
    }
};
