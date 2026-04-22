import { apiFetch } from '@/lib/client';

export type AllowedFolder = 'products' | 'brands' | 'categories' | 'avatars' | 'banners';

export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  url: string;
  asset_id: string;
  asset_folder: string;
  display_name: string;
  format: string;
  resource_type: string;
  type: string;
  version: number;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export interface CloudinaryFolder {
  name: string;
  path: string;
  external_id: string;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export interface AssetsResponse {
  resources: CloudinaryResource[];
  nextCursor: string | null;
}

interface UploadSignature {
  signature: string;
  timestamp: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

async function getUploadSignature(folder: AllowedFolder): Promise<UploadSignature> {
  const res = await apiFetch<{ data: UploadSignature }>('/api/upload/sign', {
    method: 'POST',
    body: JSON.stringify({ folder }),
  });
  return res.data;
}

export async function uploadFile(file: File, folder: AllowedFolder): Promise<UploadResult> {
  const sig = await getUploadSignature(folder);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', sig.timestamp);
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Upload thất bại');
  }

  const data = await res.json();
  return {
    public_id: data.public_id as string,
    secure_url: data.secure_url as string,
    width: data.width as number,
    height: data.height as number,
    format: data.format as string,
  };
}

export async function getAssets(
  folder?: string,
  cursor?: string,
  maxResults = 50,
  startAt?: string,
): Promise<AssetsResponse> {
  const params = new URLSearchParams({ maxResults: String(maxResults) });
  if (folder) params.set('folder', folder);
  if (cursor) params.set('cursor', cursor);
  if (startAt) params.set('startAt', startAt);
  const res = await apiFetch<{ data: AssetsResponse }>(`/api/upload/assets?${params}`);
  return res.data;
}

export async function getFolders(parent?: string): Promise<CloudinaryFolder[]> {
  const params = new URLSearchParams();
  if (parent) params.set('parent', parent);
  const qs = params.size ? `?${params}` : '';
  const res = await apiFetch<{ data: CloudinaryFolder[] }>(`/api/upload/folders${qs}`);
  return res.data;
}
