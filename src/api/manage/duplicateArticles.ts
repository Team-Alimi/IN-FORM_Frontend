import api from '@/api/axios';
import type { AdminArticleDetail } from '@/api/manage/articleDetail';

export interface SimilarArticleComparison {
  article: AdminArticleDetail;
  similar?: AdminArticleDetail;
  similarity_score?: number;
}

export interface MergeResult {
  target_id: number;
  merged: number[];
  moved: {
    vendors: number;
    bookmarks: number;
    attachments: number;
    categories: number;
    comments: number;
    notifications: number;
  };
}

export const getSimilarArticles = async (
  articleId: number
): Promise<SimilarArticleComparison> =>
  (await api.get(`/api/v1/admin/articles/${articleId}/similar`)).data.data;

export const mergeDuplicateArticles = async (
  targetId: number,
  sourceId: number
): Promise<MergeResult> =>
  (
    await api.post('/api/v1/admin/articles/merge', {
      target_id: targetId,
      source_ids: [sourceId],
    })
  ).data.data;
