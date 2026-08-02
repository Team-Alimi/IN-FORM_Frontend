/**
 * 관리자 게시글 상세 조회
 * article_id로 특정 게시글의 상세 정보를 조회
 */
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
