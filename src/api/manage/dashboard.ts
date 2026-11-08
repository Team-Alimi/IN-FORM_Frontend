import { isAxiosError } from 'axios';
import api from '@/api/axios';

/** 권한/입력 오류는 같은 요청을 반복해도 해결되지 않습니다. */
export const shouldRetryDashboardQuery = (
  failureCount: number,
  error: unknown
) => {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  return !(status && status >= 400 && status < 500) && failureCount < 3;
};

export const isDashboardForbidden = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 403;

export type ReviewStatus =
  | 'PENDING_REVIEW'
  | 'READY_TO_PUBLISH'
  | 'DRAFT'
  | 'PUBLISHED'
  | 'TRASHED';
export interface NamedOption {
  id: number;
  name: string;
}
export interface DashboardArticle {
  id: number;
  title: string;
  status: ReviewStatus;
  starts_on?: string;
  ends_on?: string;
  updated_at: string;
  vendors: NamedOption[];
  categories: NamedOption[];
}
export interface ArticleFilters {
  article_id?: number | undefined;
  keyword?: string | undefined;
  vendor_id?: number | undefined;
  category_id?: number | undefined;
  starts_from?: string | undefined;
  ends_to?: string | undefined;
  status?: ReviewStatus | undefined;
  needs_check?: boolean | undefined;
}
export interface DashboardList {
  content: DashboardArticle[];
  page_info: {
    current_page: number;
    size: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
  };
}
export interface BulkResult {
  succeeded: number[];
  failed: { id: number; code: string; message: string }[];
}

/** 서버에서 검색 조건과 페이지를 적용한 관리자 목록을 조회합니다. */
export const getDashboardArticles = async (
  filters: ArticleFilters,
  page = 1,
  size = 8
): Promise<DashboardList> => {
  const response = await api.get('/api/v1/admin/articles', {
    params: { ...filters, page, size },
  });
  return response.data.data;
};

/** 전체 선택은 현재 검색 조건에 맞는 모든 페이지가 성공한 뒤에만 완료합니다. */
export const getAllDashboardArticles = async (
  filters: ArticleFilters
): Promise<DashboardArticle[]> => {
  const rows = new Map<number, DashboardArticle>();
  let page = 1;
  let expectedCount: number | undefined;
  while (true) {
    const data = await getDashboardArticles(filters, page, 50);
    expectedCount ??= data.page_info.total_items;
    if (
      data.page_info.current_page !== page ||
      (data.page_info.has_next && !data.content.length)
    ) {
      throw new Error('전체 게시글을 조회하지 못했습니다. 다시 시도해 주세요.');
    }
    data.content.forEach((row) => rows.set(row.id, row));
    if (!data.page_info.has_next) {
      if (rows.size !== expectedCount)
        throw new Error('조회 중 목록이 변경되었습니다. 다시 시도해 주세요.');
      return [...rows.values()];
    }
    page += 1;
  }
};
export const getDashboardStats = async (): Promise<{
  pending_review: number;
  ready_to_publish: number;
}> => {
  const response = await api.get('/api/v1/admin/articles/stats');
  return response.data.data;
};
/** 비활성 항목에 연결된 공지도 검색할 수 있도록 전체 옵션을 조회합니다. */
export const getDashboardOptions = async (
  resource: 'categories' | 'vendors'
): Promise<NamedOption[]> => {
  const response = await api.get(`/api/v1/admin/${resource}`);
  return response.data.data;
};
/** HTTP 200도 건별 실패를 포함하므로 성공/실패 배열을 전달합니다. */
export const runDashboardAction = async (
  action: 'publish' | 'trash',
  ids: number[]
): Promise<BulkResult> => {
  return runBulkInBatches(ids, async (batch) => {
    const response = await api.post(`/api/v1/admin/articles/bulk/${action}`, {
      ids: batch,
    });
    return response.data.data;
  });
};

/** 관리자 일괄 API의 요청당 200건 제한을 지킵니다. */
export const runBulkInBatches = async (
  ids: number[],
  send: (batch: number[]) => Promise<BulkResult>
): Promise<BulkResult> => {
  const result: BulkResult = { succeeded: [], failed: [] };
  for (let offset = 0; offset < ids.length; offset += 200) {
    try {
      const batch = await send(ids.slice(offset, offset + 200));
      result.succeeded.push(...batch.succeeded);
      result.failed.push(...batch.failed);
    } catch (error) {
      if (offset === 0) throw error;
      result.failed.push(
        ...ids.slice(offset).map((id) => ({
          id,
          code: 'REQUEST_FAILED',
          message:
            '처리 결과를 확인하지 못했습니다. 목록을 새로 확인해 주세요.',
        }))
      );
      break;
    }
  }
  return result;
};
