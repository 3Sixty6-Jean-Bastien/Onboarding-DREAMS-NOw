import * as tenants from './routes/tenants'
import * as steps from './routes/steps'
import * as uploads from './routes/uploads'
import * as verify from './routes/verify'
import * as greenlight from './routes/greenlight'
import * as connect from './routes/connect'
import * as webhooksStripe from './routes/webhooks_stripe'
import * as welcome from './routes/welcome'
import type { Env } from './env'
import { json as j, notFound } from './lib/responses'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/' && request.method === 'GET') {
      if (env.ASSETS) {
        const res = await env.ASSETS.fetch(request)
        return new Response(await res.text(), { headers: { 'content-type': 'text/html; charset=utf-8' } })
      }
      return j({ ok: true, app: env.APP_NAME || 'onboarding' })
    }

  if (url.pathname.startsWith('/api/tenants')) return tenants.handle(request, env)
  if (url.pathname.startsWith('/api/steps')) return steps.handle(request, env)
  if (url.pathname.startsWith('/api/upload')) return uploads.handle(request, env)
  if (url.pathname.startsWith('/api/verify')) return verify.handle(request, env)
  if (url.pathname.startsWith('/api/connect')) return connect.handle(request, env)
  if (url.pathname.startsWith('/api/greenlight')) return (greenlight as any).handle ? (greenlight as any).handle(request, env) : new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
  if (url.pathname.startsWith('/webhooks/stripe')) return (webhooksStripe as any).handle ? (webhooksStripe as any).handle(request, env) : new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
  if (url.pathname.startsWith('/api/welcome')) return welcome.handle(request, env)

  return notFound()
  },

  async queue(batch: MessageBatch<any>, env: Env) {
    const { verifyConsumer } = await import('./queues/verify-consumer')
    await verifyConsumer(batch, env)
  }
}
