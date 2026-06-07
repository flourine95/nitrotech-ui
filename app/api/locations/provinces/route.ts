import { NextResponse } from 'next/server';

const PROVINCES_API = 'https://provinces.open-api.vn/api/v1/p/';

export async function GET() {
  const res = await fetch(PROVINCES_API, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: { code: 'LOCATIONS_UNAVAILABLE', message: 'Không thể tải danh sách địa chỉ' } },
      { status: 502 },
    );
  }

  return NextResponse.json(await res.json());
}
