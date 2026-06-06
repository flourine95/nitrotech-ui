import { NextRequest, NextResponse } from 'next/server';

const PROVINCE_API = 'https://provinces.open-api.vn/api/v1/p/';

export async function GET(request: NextRequest) {
  const provinceCode = request.nextUrl.searchParams.get('provinceCode');

  if (!provinceCode) {
    return NextResponse.json(
      { error: { code: 'PROVINCE_REQUIRED', message: 'Vui lòng chọn tỉnh/thành phố' } },
      { status: 400 },
    );
  }

  const res = await fetch(`${PROVINCE_API}${provinceCode}?depth=2`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: { code: 'LOCATIONS_UNAVAILABLE', message: 'Không thể tải danh sách quận/huyện' } },
      { status: 502 },
    );
  }

  const province = await res.json();
  return NextResponse.json(province.districts ?? []);
}
