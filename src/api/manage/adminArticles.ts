import api from '@/api/axios';

export interface ArticleCountsData {
  inspected_yet: number;
  reflection_waiting: number;
  suspected_duplicate: number;
  garbage: number;
}

export const getAdminArticleCounts = async (): Promise<ArticleCountsData> => {
  const response = await api.get('api/v1/admin/articles/counts');
  return response.data.data;
};
