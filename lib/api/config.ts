import { apiFetch } from '@/lib/api/client';

export interface SystemConfig {
  shipping: {
    freeThreshold: number;
    flatFee: number;
  };
}

export interface ConfigResponse {
  data: SystemConfig;
}

export async function getSystemConfig(): Promise<SystemConfig> {
  const res = await apiFetch<ConfigResponse>('/api/config');
  return res.data;
}
