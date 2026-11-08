import api from '@/api/axios';
import type { EditableArticle } from '@/api/manage/articleEditor';

export interface AdminArticleDetail extends EditableArticle {
  created_at: string;
  updated_at: string;
  similarity_score?: number;
  similar_article_id?: number;
}

export const getArticleDetail = async (
  id: number
): Promise<AdminArticleDetail> =>
  (await api.get(`/api/v1/admin/articles/${id}`)).data.data;
