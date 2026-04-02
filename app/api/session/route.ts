import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

/**
 * POST /api/session
 * Dùng refreshToken httpOnly cookie để verify session với backend,
 * sau đó set isLoggedIn cookie với Path=/ để middleware đọc được.
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value

  if (!refreshToken) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // Verify bằng cách thử refresh
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Client-Type": "web" },
    credentials: "include",
    // Forward cookie thủ công vì fetch server-side không tự gửi cookie
    headers: {
      "Content-Type": "application/json",
      "X-Client-Type": "web",
      Cookie: `refreshToken=${refreshToken}`,
    },
  })

  if (!res.ok) {
    const response = NextResponse.json({ ok: false }, { status: 401 })
    response.cookies.delete("isLoggedIn")
    return response
  }

  const json = await res.json()
  const { accessToken, refreshToken: newRefreshToken } = json.data

  const response = NextResponse.json({ ok: true, accessToken })

  // Set isLoggedIn với Path=/ để middleware đọc được
  response.cookies.set("isLoggedIn", "1", {
    httpOnly: false, // middleware cần đọc, nhưng JS cũng ok
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  // Rotate refreshToken
  response.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete("isLoggedIn")
  return response
}
