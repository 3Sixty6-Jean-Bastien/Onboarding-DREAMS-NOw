import tenants from './routes/tenants';
import steps from './routes/steps';
import uploads from './routes/uploads';
import verify from './routes/verify';
import greenlight from './routes/greenlight';
import webhooksStripe from './routes/webhooks_stripe';
const routes = [
    { method: 'GET', path: /^\/$/, handler: async () => new Response('Onboarding Agent') },
    { method: 'GET', path: /^\/api\/tenants$/, handler: tenants.list },
    { method: 'POST', path: /^\/api\/tenants$/, handler: tenants.create },
    { method: 'GET', path: /^\/api\/steps$/, handler: steps.list },
    { method: 'POST', path: /^\/api\/steps\/(.+)$/, handler: steps.update },
    { method: 'POST', path: /^\/api\/uploads$/, handler: uploads.create },
    { method: 'POST', path: /^\/api\/verify$/, handler: verify.enqueue },
    { method: 'POST', path: /^\/api\/greenlight$/, handler: greenlight.check },
    { method: 'POST', path: /^\/api\/webhooks\/stripe$/, handler: webhooksStripe.handle }
];
addEventListener('fetch', (evt) => {
    const e = evt;
    const req = e.request;
    const url = new URL(req.url);
    for (const r of routes) {
        if (r.method === req.method && r.path.test(url.pathname)) {
            try {
                const res = r.handler(req, globalThis.ENV);
                e.respondWith(Promise.resolve(res));
                return;
            }
            catch (err) {
                e.respondWith(new Response(JSON.stringify({ error: String(err) }), { status: 500 }));
                return;
            }
        }
    }
    e.respondWith(new Response('not found', { status: 404 }));
});
