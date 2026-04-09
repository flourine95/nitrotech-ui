import { apiFetch } from './client';

export interface MediaAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}

function mapResource(r: {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}): MediaAsset {
  return {
    publicId: r.public_id,
    secureUrl: r.secure_url,
    width: r.width,
    height: r.height,
    format: r.format,
    bytes: r.bytes,
    createdAt: r.created_at,
  };
}

export async function getMediaAssets(folder: string, cursor?: string, maxResults = 50) {
  const params = new URLSearchParams({ folder, maxResults: String(maxResults) });
  if (cursor) params.set('cursor', cursor);
  const res = await apiFetch<{
    data: {
      resources: Parameters<typeof mapResource>[0][];
      nextCursor: string | null;
    };
  }>(`/api/upload/assets?${params}`);
  return {
    assets: res.data.resources.map(mapResource),
    nextCursor: res.data.nextCursor ?? undefined,
  };
}
