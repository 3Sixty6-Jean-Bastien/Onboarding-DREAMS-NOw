import { handleVerifyJob } from '../lib/verify';
export async function verifyConsumer(batch, env) {
    for (const msg of batch.messages) {
        try {
            const job = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body;
            await handleVerifyJob(env, job);
            msg.ack();
        }
        catch (err) {
            console.error('verifyConsumer error', err);
            // if we fail to parse/handle, ack to avoid poison loop; adjust if needed
            try {
                msg.ack();
            }
            catch { }
        }
    }
}
