import instance from '@/api/axios';

export async function getArticleDetail(article_id: number) {
  try {
    const res = await instance.get(`/api/v1/admin/articles`, {
      params: {
        article_id,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
