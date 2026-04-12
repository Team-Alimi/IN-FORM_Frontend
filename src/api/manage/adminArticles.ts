/**
 * 관리자 게시글 관련 API 함수 모음
 *
 * - 샌드박스 게시글 목록/상세 조회
 * - 게시글 상태 일괄 변경 (반영대기, 삭제 등)
 * - 게시글 서비스 배포
 * - 휴지통 게시글 복구 / 영구 삭제
 * - 게시글 직접 등록
 */
import api from '@/api/axios';

// 게시글 검수 상태 타입
export type AdminStatus = 'INSPECTED_YET' | 'REFLECTION_WAITING' | 'SUSPECTED_DUPLICATE' | 'GARBAGE';

// 게시글 단일 항목 타입
export interface Article {
  article_id: number;
  title: string;
  admin_status: string;          // 현재 검수 상태
  previous_status: string | null; // 이전 상태
  start_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  categories: { category_id: number; category_name: string } | null; // 카테고리 (nullable)
  vendors: { vendor_id: number; vendor_name: string; vendor_initial: string; vendor_type: string }[]; // 제공처 목록
  last_modified_admin_name: string | null; // 마지막 수정 관리자 이름 (nullable)
  admin_modified_at: string | null;        // 관리자 마지막 수정 시간 (nullable)
}

// 페이지네이션 정보 타입
export interface PageInfo {
  current_page: number;
  total_pages: number;
  total_articles: number;
  has_next: boolean;
}

// 게시글 목록 응답 타입
export interface ArticleListData {
  page_info: PageInfo;
  school_articles: Article[];
}

// 대시보드 카운트 응답 타입
export interface ArticleCountsData {
  inspected_yet: number;
  reflection_waiting: number;
  suspected_duplicate: number;
  garbage: number;
}

// 게시글 상세 타입
export interface ArticleDetail {
  id: number;
  title: string;
  content: string;
  is_published: boolean;
  admin_status: string | null;
  previous_status: string | null;
  start_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  categories: { category_id: number; category_name: string } | null;
  vendors: {
    vendor_id: number;
    vendor_name: string;
    vendor_initial: string;
    vendor_type: string;
    original_url: string | null;
  }[];
  attachments: { file_id: number; attachment_url: string }[];
  last_modified_admin: { user_id: number; name: string; email: string } | null;
  admin_modified_at: string | null;
}

// 게시글 직접 등록 요청 타입
export interface CreateArticlePayload {
  article_id: number;
  title: string;
  content: string;
  category_id: number;
  start_date: string;
  due_date: string;
  vendors: {
    vendor_id: number;
    original_url: string;
  }[];
  attachment_urls: string[];
}

// 게시글 수정 요청 타입
export interface UpdateArticlePayload {
  title: string;
  content: string;
  category_id: number;
  admin_status: AdminStatus;
  start_date: string;
  due_date: string;
  vendors: {
    vendor_id: number;
    original_url: string;
  }[];
  attachment_urls: string[];
}

// [GET] api/v1/admin/articles/counts
// 샌드박스 상태별 통계 조회
export const getAdminArticleCounts = async (): Promise<ArticleCountsData> => {
  const response = await api.get('api/v1/admin/articles/counts');
  return response.data.data;
};

// [GET] /api/v1/admin/articles
// 샌드박스 상태별 게시글 목록 조회
export const getAdminArticles = async (
  status: AdminStatus,
  page = 1,
  size = 10,
): Promise<ArticleListData> => {
  const response = await api.get('/api/v1/admin/articles', {
    params: { status, page, size },
  });
  return response.data.data;
};

// [GET] /api/v1/admin/articles/:id
// 관리자 게시글 상세 조회
export const getAdminArticleDetail = async (id: number): Promise<ArticleDetail> => {
  const response = await api.get(`/api/v1/admin/articles/${id}`);
  return response.data.data;
};

// [POST] /api/v1/admin/articles/create
// 게시글 직접 등록
export const createArticle = async (
  payload: CreateArticlePayload,
): Promise<number> => {
  const response = await api.post('/api/v1/admin/articles/create', payload);
  return response.data.data; // 등록된 article_id 반환
};

// [PATCH] /api/v1/admin/articles/:id
// 게시글 수정
export const updateArticle = async (
  id: number,
  payload: UpdateArticlePayload,
): Promise<void> => {
  await api.patch(`/api/v1/admin/articles/${id}`, payload);
};

// [PATCH] /api/v1/admin/articles/status
// 샌드박스 게시글 상태 일괄 변경
export const patchAdminArticleStatus = async (
  ids: number[],
  status: AdminStatus,
): Promise<void> => {
  await api.patch('/api/v1/admin/articles/status', null, {
    params: { ids: ids.join(','), status },
  });
};

// [POST] /api/v1/admin/articles/deploy
// 게시글 서비스 배포 (is_published = true)
export const postDeployArticles = async (ids: number[]): Promise<number[]> => {
  const response = await api.post('/api/v1/admin/articles/deploy', null, {
    params: { ids: ids.join(',') },
  });
  return response.data.data;
};

// [PATCH] /api/v1/admin/sandbox/articles/restore
// GARBAGE 상태 게시글을 이전 상태로 복구
export const patchRestoreArticles = async (ids: number[]): Promise<void> => {
  await api.patch('/api/v1/admin/articles/restore', null, {
    params: { ids: ids.join(',') },
  });
};

// [DELETE] /api/v1/admin/articles/delete
// 게시글 영구 삭제
export const deleteArticles = async (ids: number[]): Promise<void> => {
  await api.delete('/api/v1/admin/articles/delete', {
    params: { ids: ids.join(',') },
  });
};
