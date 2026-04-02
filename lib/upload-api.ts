import { apiFetch } from "./api"

interface PresignResponse {
  uploadUrl: string
  publicUrl: string
}

export async function getPresignedUrl(filename: string, contentType: string, folder: string) {
  const res = await apiFetch<{ data: PresignResponse }>("/api/upload/presign", {
    method: "POST",
    body: JSON.stringify({ filename, contentType, folder }),
  })
  return res.data
}

export async function uploadToR2(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  })
  if (!res.ok) throw new Error("Upload thất bại")
}

/** Upload file và trả về publicUrl */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const { uploadUrl, publicUrl } = await getPresignedUrl(file.name, file.type, folder)
  await uploadToR2(uploadUrl, file)
  return publicUrl
}
