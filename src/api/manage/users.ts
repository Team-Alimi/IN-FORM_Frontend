import api from '@/api/axios';

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'WITHDRAWN';
export interface AdminUser {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  onboarding_completed: boolean;
  created_at: string;
  withdrawn_at?: string;
}
export interface UserFilters {
  keyword: string;
  role: UserRole | '';
  status: UserStatus | '';
}
export interface UserList {
  content: AdminUser[];
  page_info: {
    current_page: number;
    size: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
  };
}
export const getAdminUsers = async (
  filters: UserFilters,
  page: number,
  signal: AbortSignal
): Promise<UserList> => {
  const response = await api.get('/api/v1/admin/users', {
    params: {
      page,
      size: 8,
      ...(filters.keyword ? { keyword: filters.keyword } : {}),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    signal,
  });
  return response.data.data;
};
export const getAdminUser = async (
  id: number,
  signal: AbortSignal
): Promise<AdminUser> => {
  const response = await api.get(`/api/v1/admin/users/${id}`, { signal });
  return response.data.data;
};
export const changeAdminUserRole = async (
  id: number,
  role: UserRole
): Promise<AdminUser> => {
  const response = await api.patch(`/api/v1/admin/users/${id}/role`, { role });
  return response.data.data;
};
