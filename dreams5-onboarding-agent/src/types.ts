export type Tenant = { id: string; name?: string }
export type Step = { id: string; tenant_id: string; step_key: string; status?: string; data?: any }
