import api from '@/api/axios';

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
  const response = await api.post(`/api/v1/admin/articles/bulk/${action}`, {
    ids,
  });
  return response.data.data;
};
