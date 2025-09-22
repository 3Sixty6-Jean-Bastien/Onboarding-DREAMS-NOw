export const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
export const error = (message, status = 400) => json({ error: message }, status);
export const notFound = (msg = 'not found') => json({ error: msg }, 404);
