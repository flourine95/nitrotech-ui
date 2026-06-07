import { NextRequest, NextResponse } from 'next/server';

const DISTRICT_API = 'https://provinces.open-api.vn/api/v1/d/';

export async function GET(request: NextRequest) {
  const districtCode = request.nextUrl.searchParams.get('districtCode');

  if (!districtCode) {
    return NextResponse.json(
      { error: { code: 'DISTRICT_REQUIRED', message: 'Vui lòng chọn quận/huyện' } },
      { status: 400 },
    );
  }

  const res = await fetch(`${DISTRICT_API}${districtCode}?depth=2`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: { code: 'LOCATIONS_UNAVAILABLE', message: 'Không thể tải danh sách phường/xã' } },
      { status: 502 },
    );
  }

  const district = await res.json();
  return NextResponse.json(district.wards ?? []);
}
