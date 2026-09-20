import api from '@/api/axios';
import {
  getDashboardArticles,
  runDashboardAction,
} from '@/api/manage/dashboard';
import type { ArticleFilters, BulkResult } from '@/api/manage/dashboard';

export type ReviewAction = 'ready' | 'trash';
export type ReviewFilters = Omit<ArticleFilters, 'status' | 'needs_check'>;

/** 확인 필요도 미검수 상태 안에서 조회하며, 서버 전체 목록에 조건을 적용합니다. */
export const getUnreviewedArticles = (
  filters: ReviewFilters,
  page: number,
  needsCheck = false
) =>
  getDashboardArticles(
    {
      ...filters,
      status: 'PENDING_REVIEW',
      ...(needsCheck ? { needs_check: true } : {}),
    },
    page,
    5
  );

/** 검수 완료는 반영대기까지만 이동합니다. 실제 발행은 별도 단계입니다. */
export const runReviewAction = async (
  action: ReviewAction,
  ids: number[]
): Promise<BulkResult> => {
  if (action === 'trash') return runDashboardAction('trash', ids);
  const response = await api.post('/api/v1/admin/articles/bulk/status', {
    ids,
    status: 'READY_TO_PUBLISH',
  });
  return response.data.data;
};
