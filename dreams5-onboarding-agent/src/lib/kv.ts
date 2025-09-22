export const getConfig = async (kv: any, key = 'kv_config') => {
  const raw = await kv.get(key)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}
