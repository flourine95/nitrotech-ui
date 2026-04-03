import { apiFetch } from "./api"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UploadSignature {
  signature: string
  timestamp: string
  apiKey: string
  cloudName: string
  folder: string
}

export interface CloudinaryResource {
  public_id: string
  secure_url: string
  url: string
  asset_id: string
  asset_folder: string
  display_name: string
  format: string
  resource_type: string
  type: string
  version: number
  width: number
  height: number
  bytes: number
  created_at: string
}

export interface CloudinaryFolder {
  name: string
  path: string
  external_id: string
}

export type AllowedFolder = "products" | "brands" | "categories" | "avatars" | "banners"

// ── Step 1: Get signature ─────────────────────────────────────────────────────

export async function getUploadSignature(folder: AllowedFolder): Promise<UploadSignature> {
  const res = await apiFetch<{ data: UploadSignature }>("/api/upload/sign", {
    method: "POST",
    body: JSON.stringify({ folder }),
  })
  return res.data
}

// ── Step 2: Upload directly to Cloudinary ────────────────────────────────────

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
}

/**
 * Upload file lên Cloudinary theo đúng flow 3 bước từ spec:
 * 1. Lấy signature từ backend
 * 2. Upload trực tiếp lên Cloudinary
 * 3. Trả về public_id (dùng để lưu vào DB) và secure_url
 */
export async function uploadFile(file: File, folder: AllowedFolder): Promise<UploadResult> {
  const sig = await getUploadSignature(folder)

  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", sig.apiKey)
  formData.append("timestamp", sig.timestamp)
  formData.append("signature", sig.signature)
  formData.append("folder", sig.folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: formData }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? "Upload thất bại")
  }

  const data = await res.json()
  return {
    public_id: data.public_id as string,
    secure_url: data.secure_url as string,
    width: data.width as number,
    height: data.height as number,
    format: data.format as string,
  }
}

// ── List assets ───────────────────────────────────────────────────────────────

export interface AssetsResponse {
  resources: CloudinaryResource[]
  nextCursor: string | null
}

export async function getAssets(
  folder: string,
  cursor?: string,
  maxResults = 50
): Promise<AssetsResponse> {
  const params = new URLSearchParams({ folder, maxResults: String(maxResults) })
  if (cursor) params.set("cursor", cursor)
  const res = await apiFetch<{ data: { resources: CloudinaryResource[]; nextCursor: string | null } }>(
    `/api/upload/assets?${params}`
  )
  return res.data
}

// ── List folders ──────────────────────────────────────────────────────────────

export async function getFolders(parent?: string): Promise<CloudinaryFolder[]> {
  const params = new URLSearchParams()
  if (parent) params.set("parent", parent)
  const res = await apiFetch<{ data: CloudinaryFolder[] }>(
    `/api/upload/folders${params.size ? `?${params}` : ""}`
  )
  return res.data
}

// ── Cloudinary transformation URL builder ────────────────────────────────────

const CLOUD_BASE = "https://res.cloudinary.com"

export type TransformPreset = "thumbnail" | "product" | "banner" | "avatar" | "logo"

const TRANSFORMS: Record<TransformPreset, string> = {
  thumbnail: "w_200,h_200,c_fill,f_auto,q_auto",
  product:   "w_800,h_800,c_fill,f_auto,q_auto",
  banner:    "w_1920,h_600,c_fill,f_auto,q_auto",
  avatar:    "w_100,h_100,c_thumb,g_face,f_auto,q_auto",
  logo:      "w_200,h_200,c_pad,b_white,f_auto,q_auto",
}

export function buildCloudinaryUrl(
  cloudName: string,
  publicId: string,
  preset: TransformPreset = "thumbnail"
): string {
  return `${CLOUD_BASE}/${cloudName}/image/upload/${TRANSFORMS[preset]}/${publicId}`
}
