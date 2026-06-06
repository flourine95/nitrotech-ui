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
const districtsPromises = new Map<string, Promise<LocationDistrict[]>>();
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

export async function getVietnamDistricts(provinceCode: string): Promise<LocationDistrict[]> {
  if (!districtsPromises.has(provinceCode)) {
    districtsPromises.set(provinceCode, fetchVietnamDistricts(provinceCode));
  }

  return districtsPromises.get(provinceCode)!;
}

async function fetchVietnamDistricts(provinceCode: string): Promise<LocationDistrict[]> {
  const q = new URLSearchParams({ provinceCode });
  const res = await fetch(`/api/locations/districts?${q}`);

  if (!res.ok) {
    throw new Error('Không thể tải danh sách quận/huyện');
  }

  return res.json();
}

export async function getVietnamWards(districtCode: string): Promise<LocationWard[]> {
  if (!wardsPromises.has(districtCode)) {
    wardsPromises.set(districtCode, fetchVietnamWards(districtCode));
  }

  return wardsPromises.get(districtCode)!;
}

async function fetchVietnamWards(districtCode: string): Promise<LocationWard[]> {
  const q = new URLSearchParams({ districtCode });
  const res = await fetch(`/api/locations/wards?${q}`);

  if (!res.ok) {
    throw new Error('Không thể tải danh sách phường/xã');
  }

  return res.json();
}
