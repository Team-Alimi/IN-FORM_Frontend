import api from '@/api/axios';
import { isAxiosError } from 'axios';
import type { NamedOption, ReviewStatus } from '@/api/manage/dashboard';

export type SourceType = 'SCHOOL' | 'CLUB';
export interface EditorOption extends NamedOption {
  is_active: boolean;
}
export interface VendorOption extends EditorOption {
  type: SourceType;
}
export interface ArticleVendor {
  id?: number;
  vendor_id: number;
  vendor_name: string;
  source_url?: string;
  external_key?: string;
}
export interface ArticleAttachment {
  id?: number;
  file_url: string;
  original_name?: string;
  content_type?: string;
  size_bytes?: number;
}
export interface EditableArticle {
  id: number;
  source_type: SourceType;
  status: ReviewStatus;
  title: string;
  content: string;
  starts_on?: string;
  ends_on?: string;
  categories: NamedOption[];
  vendors: ArticleVendor[];
  attachments: ArticleAttachment[];
}
export interface ArticleWritePayload {
  article_id?: number;
  source_type?: SourceType;
  status?: ReviewStatus;
  title: string;
  content: string;
  starts_on?: string;
  ends_on?: string;
  category_ids: number[];
  vendors: { id?: number; vendor_id: number; source_url?: string }[];
  attachments: ArticleAttachment[];
}
export const getEditorArticle = async (id: number): Promise<EditableArticle> =>
  (await api.get(`/api/v1/admin/articles/${id}`)).data.data;
export const checkEditorArticleId = async (id: number): Promise<boolean> => {
  try {
    await getEditorArticle(id);
    return true;
  } catch (error) {
    // Only the documented missing-article error means the ID is unused.
    if (
      isAxiosError(error) &&
      error.response?.status === 404 &&
      error.response.data?.error?.code === 'ARTICLE_NOT_FOUND'
    )
      return false;
    throw error;
  }
};
export const findEditorDuplicates = async (
  title: string
): Promise<{
  exists: boolean;
  articles: { id: number; title: string; status: ReviewStatus }[];
}> =>
  (
    await api.get('/api/v1/admin/articles/duplicate-check', {
      params: { title },
    })
  ).data.data;
export const getEditorCategories = async (): Promise<EditorOption[]> =>
  (await api.get('/api/v1/admin/categories')).data.data;
export const getEditorVendors = async (
  type: SourceType
): Promise<VendorOption[]> =>
  (
    await api.get('/api/v1/admin/vendors', {
      params: { type, is_active: true },
    })
  ).data.data;
export const saveEditorArticle = async (
  payload: ArticleWritePayload,
  id?: number
): Promise<{ id: number }> =>
  (id === undefined
    ? await api.post('/api/v1/admin/articles', payload)
    : await api.patch(`/api/v1/admin/articles/${id}`, payload)
  ).data.data;
export const uploadEditorFiles = async (
  files: File[]
): Promise<ArticleAttachment[]> => {
  const body = new FormData();
  files.forEach((file) => body.append('files', file));
  return (await api.post('/api/v1/admin/files', body)).data.data;
};
export const discardEditorFiles = async (
  fileUrls: string[]
): Promise<{ deleted: number }> =>
  (await api.delete('/api/v1/admin/files', { data: { file_urls: fileUrls } }))
    .data.data;
export const editorErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError(error) &&
  typeof error.response?.data?.error?.message === 'string'
    ? error.response.data.error.message
    : fallback;
