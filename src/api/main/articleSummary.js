import api from '@/api/axios';

export const fetchArticleSummary = async (articleId, signal) => {
  const response = await api.get(`/api/v1/articles/${articleId}/summary`, { signal });
  return response.data.data;
};
