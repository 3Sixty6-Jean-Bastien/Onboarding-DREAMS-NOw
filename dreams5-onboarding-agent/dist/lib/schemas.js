import { z } from 'zod';
export const CreateTenantSchema = z.object({ name: z.string().min(1) });
export const UpdateStepSchema = z.object({ tenant_id: z.string().optional(), status: z.string().optional(), data: z.any().optional(), id: z.string().optional() });
export const UploadRequestSchema = z.object({ tenantId: z.string().optional(), filename: z.string().min(1), type: z.string().optional() });
export const VerifyTaskSchema = z.object({ kind: z.string(), tenantId: z.string().optional(), payload: z.any().optional() });
