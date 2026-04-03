import { apiFetch } from "./api"

interface SignResponse {
  signature: string
  timestamp: string
  apiKey: string
  cloudName: string
  folder: string
}

async function getSignature(folder: string) {
  const res = await apiFetch<{ data: SignResponse }>("/api/upload/sign", {
    method: "POST",
    body: JSON.stringify({ folder }),
  })
  return res.data
}

/** Upload file lên Cloudinary và trả về secure_url */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await getSignature(folder)

  const formData = new FormData()
  formData.append("file", file)
  formData.append("signature", signature)
  formData.append("timestamp", timestamp)
  formData.append("api_key", apiKey)
  formData.append("folder", signedFolder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) throw new Error("Upload thất bại")

  const data = await res.json()
  return data.secure_url as string
}
