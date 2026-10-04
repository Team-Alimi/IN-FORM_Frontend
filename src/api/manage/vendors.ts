import api from '@/api/axios';

export type VendorType = 'SCHOOL' | 'CLUB';
export interface ClubType {
  id: number;
  name: string;
}
export const getClubTypes = async (): Promise<ClubType[]> =>
  (await api.get('/api/v1/club-types')).data.data;

export interface AdminVendor {
  id: number;
  name: string;
  initial: string;
  type: VendorType;
  homepage_url?: string;
  is_active: boolean;
  created_at: string;
  warning?: string;
  club_types?: ClubType[];
}
export interface VendorFilters {
  type: VendorType | '';
  active: '' | 'true' | 'false';
}
export interface CreateVendor {
  name: string;
  initial: string;
  type: VendorType;
  homepage_url?: string;
  club_type_ids?: number[];
}
export interface UpdateVendor {
  club_type_ids?: number[];
  name?: string;
  homepage_url?: string;
  is_active?: boolean;
}
export const getAdminVendors = async (
  filters: VendorFilters,
  signal: AbortSignal
): Promise<AdminVendor[]> => {
  const response = await api.get('/api/v1/admin/vendors', {
    params: {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.active !== ''
        ? { is_active: filters.active === 'true' }
        : {}),
    },
    signal,
  });
  return response.data.data;
};
export const createAdminVendor = async (
  payload: CreateVendor
): Promise<AdminVendor> => {
  const response = await api.post('/api/v1/admin/vendors', payload);
  return response.data.data;
};
export const updateAdminVendor = async (
  id: number,
  payload: UpdateVendor
): Promise<AdminVendor> => {
  const response = await api.patch(`/api/v1/admin/vendors/${id}`, payload);
  return response.data.data;
};
