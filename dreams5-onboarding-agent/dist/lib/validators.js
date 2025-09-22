export const isString = (v) => typeof v === 'string';
export const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
