export const isString = (v: any) => typeof v === 'string'
export const isObject = (v: any) => v && typeof v === 'object' && !Array.isArray(v)
