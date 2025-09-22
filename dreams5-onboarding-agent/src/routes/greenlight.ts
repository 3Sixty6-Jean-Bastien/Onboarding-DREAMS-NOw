import { getConfig } from '../lib/kv'

function toNumber(v?: string) { const n = v ? parseInt(v, 10) : NaN; return Number.isFinite(n) ? n : undefined }

export async function handle(request: Request, env: any) {
  const url = new URL(request.url)
  const tenantId = url.searchParams.get('tenant_id') || url.searchParams.get('tenantId') || ''
  if (!tenantId) return new Response(JSON.stringify({ error: 'tenant_id required' }), { status: 400, headers: { 'content-type': 'application/json' } })
  const cfg = await getConfig(env.KV_CONFIG).catch(() => null) as any
  const requiredSteps: string[] = (cfg?.steps?.map((s: any) => s.key) || ['setup-domain','connect-ga4']).concat(['payment'])
  try {
    const res = await env.DB.prepare('SELECT step_key, status FROM steps WHERE tenant_id = ? ORDER BY updated_at DESC').bind(tenantId).all()
    const latest = new Map<string, string>()
    for (const row of (res.results || []) as any[]) {
      if (!latest.has(row.step_key)) latest.set(row.step_key, row.status)
    }
    const satisfied = new Set<string>()
    for (const key of latest.keys()) {
      const st = latest.get(key)
      if (st && ['verified','completed','succeeded','stored'].includes(st)) satisfied.add(key)
    }
    const missing = requiredSteps.filter(k => !satisfied.has(k))
    const minRequired = toNumber(env.GREENLIGHT_MIN_REQUIRED) ?? requiredSteps.length
    const score = satisfied.size
    const greenlight = missing.length === 0 || score >= minRequired
    return new Response(JSON.stringify({ tenantId, greenlight, score, minRequired, satisfied: Array.from(satisfied), missing, requiredSteps }), { headers: { 'content-type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
