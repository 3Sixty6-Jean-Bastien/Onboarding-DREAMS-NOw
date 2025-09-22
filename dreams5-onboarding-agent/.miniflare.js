// Minimal Miniflare config for local development and smoke tests.
// Use with: `npx wrangler dev --local --persist-to=./.wrangler/state --miniflare-config ./.miniflare.js`
export default ({
  bindings: {
    KV_CONFIG: new Map(),
    DB: {},
    R2_ASSETS: {},
    ONBOARD_BRAIN: {},
    VERIFY_QUEUE: {}
  },
  modules: true,
  port: 8787
})
