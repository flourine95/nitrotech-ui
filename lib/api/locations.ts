export interface LocationWard {
  code: number;
  name: string;
}

export interface LocationDistrict {
  code: number;
  name: string;
  wards: LocationWard[];
}

export interface LocationProvince {
  code: number;
  name: string;
  districts?: LocationDistrict[];
}

let provincesPromise: Promise<LocationProvince[]> | null = null;
const wardsPromises = new Map<string, Promise<LocationWard[]>>();

export async function getVietnamProvinces(): Promise<LocationProvince[]> {
  provincesPromise ??= fetchVietnamProvinces();
  return provincesPromise;
}

async function fetchVietnamProvinces(): Promise<LocationProvince[]> {
  const res = await fetch('/api/locations/provinces');

  if (!res.ok) {
    throw new Error('Không thể tải danh sách địa chỉ');
  }

  return res.json();
}

export async function getVietnamWards(provinceCode: string): Promise<LocationWard[]> {
  if (!wardsPromises.has(provinceCode)) {
    wardsPromises.set(provinceCode, fetchVietnamWards(provinceCode));
  }

  return wardsPromises.get(provinceCode)!;
}

async function fetchVietnamWards(provinceCode: string): Promise<LocationWard[]> {
  const q = new URLSearchParams({ provinceCode });
  const res = await fetch(`/api/locations/wards?${q}`);

  if (!res.ok) {
    throw new Error('Không thể tải danh sách phường/xã');
  }

  return res.json();
}
