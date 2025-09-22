import { UpdateStepSchema } from '../lib/schemas'

const impl = {
  async list(request: Request, env: any) {
    try {
      const url = new URL(request.url)
      const tenantId = url.searchParams.get('tenant_id') || url.searchParams.get('tenantId')
      const sql = tenantId
        ? 'SELECT * FROM steps WHERE tenant_id = ? ORDER BY updated_at DESC LIMIT 200'
        : 'SELECT * FROM steps ORDER BY updated_at DESC LIMIT 100'
      const res = tenantId
        ? await env.DB.prepare(sql).bind(tenantId).all()
        : await env.DB.prepare(sql).all()
      return new Response(JSON.stringify({ steps: res.results || [] }), { headers: { 'content-type': 'application/json' } })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
    }
  },
  async update(request: Request, env: any) {
    const url = new URL(request.url)
    const match = url.pathname.match(/\/api\/steps\/(.+)$/)
    const stepKey = match ? match[1] : undefined
    const raw = await request.json().catch(() => ({}))
    const parsed = UpdateStepSchema.safeParse(raw)
    if (!parsed.success) return new Response(JSON.stringify({ error: 'validation', issues: parsed.error.format() }), { status: 422, headers: { 'content-type': 'application/json' } })
    const body = parsed.data
    if (!stepKey) return new Response(JSON.stringify({ error: 'missing step key' }), { status: 400, headers: { 'content-type': 'application/json' } })
    try {
      const id = body.id || `${stepKey}-${Date.now()}`
      await env.DB.prepare('INSERT INTO steps (id, tenant_id, step_key, status, data) VALUES (?, ?, ?, ?, ?)').run(id, body.tenant_id || null, stepKey, body.status || null, JSON.stringify(body.data || {}))
      return new Response(JSON.stringify({ step: id, key: stepKey }), { headers: { 'content-type': 'application/json' } })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
    }
  }
}

export async function handle(request: Request, env: any) {
  if (request.method === 'GET') return impl.list(request, env)
  if (request.method === 'POST') return impl.update(request, env)
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } })
}
