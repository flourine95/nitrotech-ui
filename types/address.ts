export interface Address {
  id: number;
  userId: number;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressResponse {
  data: Address;
  message?: string;
}

export interface AddressListResponse {
  data: Address[];
}
