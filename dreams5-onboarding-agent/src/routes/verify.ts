import { VerifyTaskSchema } from '../lib/schemas'
import { handleVerifyJob } from '../lib/verify'

const impl = {
  async enqueue(request: Request, env: any) {
    const raw = await request.json().catch(() => ({}))
    const parsed = VerifyTaskSchema.safeParse(raw)
    if (!parsed.success) return new Response(JSON.stringify({ error: 'validation', issues: parsed.error.format() }), { status: 422, headers: { 'content-type': 'application/json' } })
    const body = parsed.data
    try {
      if (env.VERIFY_QUEUE) {
        await env.VERIFY_QUEUE.send(JSON.stringify(body))
        return new Response(JSON.stringify({ enqueued: body }), { headers: { 'content-type': 'application/json' } })
      }

      await handleVerifyJob(env, body)
      return new Response(JSON.stringify({ processed: body }), { headers: { 'content-type': 'application/json' } })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
    }
  }
}

export async function handle(request: Request, env: any) {
  if (request.method === 'POST') return impl.enqueue(request, env)
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } })
}
