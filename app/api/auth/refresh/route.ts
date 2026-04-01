import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value

  if (!refreshToken) {
    return NextResponse.json(
      { status: 401, code: "UNAUTHORIZED", message: "Phiên đăng nhập hết hạn" },
      { status: 401 }
    )
  }

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  const json = await res.json()

  if (!res.ok) {
    // Token hết hạn — xóa cookie
    const response = NextResponse.json(json, { status: res.status })
    response.cookies.delete("refreshToken")
    return response
  }

  const { accessToken, refreshToken: newRefreshToken } = json.data

  const response = NextResponse.json({ data: { accessToken } }, { status: 200 })

  response.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}
