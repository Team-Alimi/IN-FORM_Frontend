import type {
  ArticleVendor as FormVendor,
  ArticleAttachment as FormAttachment,
} from '@/api/manage/articleEditor';
/**
 * MANDTE : 관리자 시스템 게시글 수정하기/게시하기
 * [GET] : 요청에 대한 응답
 * OManageArticleDetail : OutPut
 * /api/v1/admin/articles/{articleId}
 */
export interface OManageArticleDetail {
  success: boolean | undefined;
  data: {
    id: number;
    source_type: string;
    status: string;
    title: string;
    content: string;
    summary: string;
    starts_on: string;
    ends_on: string;
    published_at: string;
    similarity_score: number;
    similar_article_id: number | undefined; // 유사도가 낮을 경우 없을 수도 있으니까?
    created_at: string;
    updated_at: string;
    categories: {
      id: number;
      name: string;
    }[];
    vendors: {
      id: number;
      vendor_id: number;
      vendor_name: string;
      source_url: string;
      external_key: string;
    }[];
    attachments:
      | {
          id: number;
          file_url: string;
          original_name: string;
          content_type: string;
          size_bytes: number;
        }[]
      | [];
  };
  error: number | null;
}
/**
 * [MANDTE] : 관리자 시스템 게시글 수정로그
 * [GET] : 요청에 대한 응답
 * OManageArticleDetailLog : OutPut
 * /api/v1/admin/articles/{articleId}
 */
export interface OManageArticleDetailLog {
  status_logs:
    | {
        id: number | undefined | null;
        from_status: string | undefined | null; //변경 전 상태
        to_status: string | undefined | null; //변경 후 상태
        memo: string | undefined | null;
        created_at: string | undefined | null;
        changed_by: number | undefined | null;
        changed_by_name: number | undefined | null;
      }[]
    | [];
}
/**
 * [MANDTE] : 관리자 시스템 게시글 수정 PayLoad
 * [PATCH] : 수정하고 싶은 항목을 서버로 전달
 * OManageArticleDetailLog : OutPut
 * /api/v1/admin/articles/{articleId}
 */
export interface IUpdateArticlePayload {
  title: string | undefined | null;
  content: string | undefined | null;
  starts_on: string | undefined | null;
  ends_on: string | undefined | null;
  category_ids: number[]; //🥚추후 확인 필요 넘버로 구분할건지
  vendors: FormVendor[];
  attachments: FormAttachment[];
  //😒STATUS 프롭 누락 확인
}
/**
 * [MANDTE] : 관리자 시스템 게시글 등록 PayLoad
 * [POST] : 등록하고자 하는 게시글 내용을 서버로 전달
 * OManageArticleDetailLog : OutPut
 * /api/v1/admin/articles/{articleId}
 */
export interface IRegisterArticlePayload {
  article_id?: number | null; //게시글 아이디 입력 미입력시 자동으로 생성
  source_type?: string; //CLUB|SCHOOL Default: SCHOOL
  status?: string | null; //초기상태
  title: string; //게시글 정보
  content: string;
  starts_on?: string | null;
  ends_on?: string | null;
  category_ids: number[];
  vendors: FormVendor[];
  attachments: FormAttachment[];
}
