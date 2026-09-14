/**
 * 관리자 게시글 ID 중복 확인
 * 직접 등록 시 입력한 article_id가 이미 존재하는지 검사
 */
import instance from '@/api/axios';

export async function checkArticleIdDuplicate(article_id: number) {
  try {
    const res = await instance.get('/api/v1/admin/articles/check-id', {
      params: {
        article_id,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
