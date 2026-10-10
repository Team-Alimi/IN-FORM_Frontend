import api from '@/api/axios';
export type AnnouncementType = 'MAINTENANCE' | 'UPDATE' | 'EVENT' | 'GENERAL';
export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export interface Announcement {
  id: number;
  type: AnnouncementType;
  title: string;
  content: string;
  image_url?: string;
  status: AnnouncementStatus;
  is_popup: boolean;
  starts_on?: string;
  ends_on?: string;
  published_at?: string;
  warnings: string[];
}
export interface AnnouncementInput {
  type: AnnouncementType;
  title: string;
  content: string;
  image_url?: string;
  clear_image?: boolean;
  is_popup: boolean;
  starts_on?: string;
  ends_on?: string;
  clear_period?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
}
export const getAdminAnnouncements = async (
  params: { page: number; status?: string; type?: string; is_popup?: boolean },
  signal?: AbortSignal
): Promise<{
  content: Announcement[];
  page_info: { current_page: number; total_pages: number; has_next: boolean };
}> => {
  const response = await api.get('/api/v1/admin/announcements', {
    params: { ...params, size: 20 },
    ...(signal ? { signal } : {}),
  });
  return response.data.data;
};
export const saveAnnouncement = async (
  id: number | undefined,
  payload: AnnouncementInput
): Promise<Announcement> => {
  const response = id
    ? await api.patch(`/api/v1/admin/announcements/${id}`, payload)
    : await api.post('/api/v1/admin/announcements', payload);
  return response.data.data;
};
export const transitionAnnouncement = async (
  id: number,
  action: 'publish' | 'archive'
): Promise<Announcement> => {
  const response = await api.post(
    `/api/v1/admin/announcements/${id}/${action}`
  );
  return response.data.data;
};

export const uploadAnnouncementImage = async (file: File): Promise<string> => {
  const body = new FormData();
  body.append('files', file);
  const response = await api.post('/api/v1/admin/files', body);
  return response.data.data[0].file_url;
};

export const discardAnnouncementImages = async (fileUrls: string[]): Promise<void> => {
  await api.delete('/api/v1/admin/files', { data: { file_urls: fileUrls } });
};
