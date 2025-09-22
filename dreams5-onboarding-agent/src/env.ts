export interface Env {
  DB: D1Database;
  KV_CONFIG: KVNamespace;
  R2_ASSETS: R2Bucket;
  OnboardBrain: DurableObjectNamespace;
  VERIFY_QUEUE?: Queue<any>;
  APP_NAME?: string;
  GREENLIGHT_MIN_REQUIRED?: string;
  ASSETS?: any;
  SECRET_KEY?: string;
  HUBSPOT_API_KEY?: string;
}
