import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value
  const authHeader = req.headers.get("Authorization")

  // Gọi backend revoke token (best-effort, không throw nếu lỗi)
  if (refreshToken) {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {})
  }

  const response = NextResponse.json({ message: "Logged out successfully" })
  response.cookies.delete("refreshToken")
  return response
}
