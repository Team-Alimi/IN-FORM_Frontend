import api from '@/api/axios';
import type {
  BulkResult,
  DashboardArticle,
  DashboardList,
  ReviewStatus,
} from '@/api/manage/dashboard';

export interface TrashArticle extends DashboardArticle {
  previous_status?: Exclude<ReviewStatus, 'TRASHED'>;
}
export interface TrashList extends DashboardList {
  content: TrashArticle[];
}

/** 휴지통 전용 API만 삭제 직전 상태를 제공합니다. 검색 인자는 지원하지 않습니다. */
const getTrashPage = async (
  page = 1,
  signal?: AbortSignal
): Promise<TrashList> => {
  const response = await api.get('/api/v1/admin/articles/trash', {
    params: { page, size: 50 },
    ...(signal ? { signal } : {}),
  });
  return response.data.data;
};

/** 모든 페이지가 성공한 경우에만 검색 가능한 전체 목록을 공개합니다. */
export const getTrashArticles = async (
  signal?: AbortSignal
): Promise<TrashArticle[]> => {
  const rows = new Map<number, TrashArticle>();
  let page = 1;
  while (true) {
    const data = await getTrashPage(page, signal);
    data.content.forEach((row) => rows.set(row.id, row));
    if (!data.page_info.has_next) break;
    if (data.page_info.current_page !== page || !data.content.length) {
      throw new Error(
        '휴지통 목록을 끝까지 조회하지 못했습니다. 다시 시도해 주세요.'
      );
    }
    page += 1;
  }
  return [...rows.values()];
};

export const runTrashAction = async (
  action: 'restore' | 'delete',
  ids: number[]
): Promise<BulkResult> => {
  const response = await api.post(`/api/v1/admin/articles/bulk/${action}`, {
    ids,
  });
  return response.data.data;
};
