import { UploadRequestSchema } from '../lib/schemas'

const impl = {
  async create(request: Request, env: any) {
    const raw = await request.json().catch(() => ({}))
    const parsed = UploadRequestSchema.safeParse(raw)
    if (!parsed.success) return new Response(JSON.stringify({ error: 'validation', issues: parsed.error.format() }), { status: 422, headers: { 'content-type': 'application/json' } })
    const body = parsed.data
    const key = `uploads/${Date.now()}-${body.filename || 'file'}`
    try {
      const url = env.R2_ASSETS ? await env.R2_ASSETS.createPresignedUrl?.({ method: 'PUT', key, expiration: 600 }) : `https://${env.R2_ASSETS || 'r2'}.example/${encodeURIComponent(key)}`
      if (env.DB) {
        await env.DB.prepare('INSERT INTO uploads (id, tenant_id, filename, r2_key) VALUES (?, ?, ?, ?)').run(key, body.tenantId || null, body.filename || null, key)
      }
      return new Response(JSON.stringify({ uploadUrl: url, key }), { headers: { 'content-type': 'application/json' } })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
    }
  }
}

export async function handle(request: Request, env: any) {
  if (request.method === 'POST') return impl.create(request, env)
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } })
}
