export type VerifyJob = { kind: string; tenantId?: string; payload?: any }

async function recordStep(env: any, tenantId: string | null | undefined, stepKey: string, status: string, data: any = {}) {
  const safeTenantId = tenantId || 'unknown'
  const id = `${safeTenantId}:${stepKey}:${Date.now()}`
  await env.DB.prepare('INSERT INTO steps (id, tenant_id, step_key, status, data) VALUES (?, ?, ?, ?, ?)')
    .run(id, tenantId || null, stepKey, status, JSON.stringify(data))
}

export async function handleVerifyJob(env: any, job: VerifyJob) {
  const ok = job?.payload?.verified === true || job?.payload?.ok === true
  switch (job.kind) {
    case 'dns':
      await recordStep(env, job.tenantId, 'setup-domain', ok ? 'verified' : 'failed', job.payload)
      break
    case 'ga4':
      await recordStep(env, job.tenantId, 'connect-ga4', ok ? 'verified' : 'failed', job.payload)
      break
    case 'pixel':
      await recordStep(env, job.tenantId, 'pixels', ok ? 'verified' : 'failed', job.payload)
      break
    case 'gbp':
      await recordStep(env, job.tenantId, 'gbp-claim', ok ? 'verified' : 'failed', job.payload)
      break
    case 'file':
      await recordStep(env, job.tenantId, 'brand-kit', ok ? 'verified' : 'failed', job.payload)
      break
    case 'hubspot':
      await recordStep(env, job.tenantId, 'connect-hubspot', ok ? 'verified' : 'failed', job.payload)
      break
    default:
      await recordStep(env, job.tenantId, job.kind, ok ? 'verified' : 'failed', job.payload)
  }
}
