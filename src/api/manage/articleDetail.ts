import api from '@/api/axios';
import type { EditableArticle } from '@/api/manage/articleEditor';

export interface AdminArticleDetail extends EditableArticle {
  created_at: string;
  updated_at: string;
}

export const getArticleDetail = async (
  id: number
): Promise<AdminArticleDetail> =>
  (await api.get(`/api/v1/admin/articles/${id}`)).data.data;
