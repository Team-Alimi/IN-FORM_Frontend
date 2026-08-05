/**
 * [MOCK] src/api/main/articles.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchEvents       : 학교 공지사항 목록 (키워드 검색 + 페이지네이션 지원)
 *   - fetchEventDetail  : 학교 공지사항 상세 (id로 조회, 없으면 기본 더미 반환)
 *   - fetchImminentEvents : 마감 임박 공지사항 (status === "EndingSoon")
 *   - fetchHotEvents    : 인기 공지사항 목록
 *   - fetchClubs        : 동아리 공지사항 목록 (키워드 검색 + 페이지네이션 지원)
 *   - fetchClubDetail   : 동아리 공지사항 상세
 */
import {
  MOCK_SCHOOL_ARTICLES,
  MOCK_SCHOOL_ARTICLE_DETAILS,
  MOCK_HOT_ARTICLES,
  MOCK_CLUB_ARTICLES,
  MOCK_CLUB_ARTICLE_DETAILS,
} from "@/mocks/data";

export const fetchEvents = async (params) => {
  const { page = 1, size = 8, keyword = "" } = params || {};
  const filtered = keyword
    ? MOCK_SCHOOL_ARTICLES.filter((a) => a.title.includes(keyword))
    : MOCK_SCHOOL_ARTICLES;
  const start = (page - 1) * size;
  const paginated = filtered.slice(start, start + size);
  return {
    data: {
      data: {
        school_articles: paginated,
        page_info: {
          current_page: page,
          total_pages: Math.ceil(filtered.length / size) || 1,
          total_articles: filtered.length,
        },
      },
    },
  };
};

export const fetchEventDetail = async (id) => {
  const found = MOCK_SCHOOL_ARTICLES.find(
    (a) => String(a.article_id) === String(id)
  );
  const detail = MOCK_SCHOOL_ARTICLE_DETAILS[id] ?? MOCK_SCHOOL_ARTICLE_DETAILS[101];
  return {
    ...(found ?? MOCK_SCHOOL_ARTICLES[0]),
    ...detail,
  };
};

export const fetchImminentEvents = async () => {
  const imminent = MOCK_SCHOOL_ARTICLES.filter((a) => a.status === "EndingSoon");
  return { data: { data: imminent } };
};

export const fetchHotEvents = async () => {
  return { data: MOCK_HOT_ARTICLES };
};

export const fetchClubs = async (params) => {
  const { page = 1, size = 4, keyword = "" } = params || {};
  const filtered = keyword
    ? MOCK_CLUB_ARTICLES.filter((a) => a.title.includes(keyword))
    : MOCK_CLUB_ARTICLES;
  const start = (page - 1) * size;
  const paginated = filtered.slice(start, start + size);
  return {
    data: {
      data: {
        club_articles: paginated,
        page_info: {
          current_page: page,
          total_pages: Math.ceil(filtered.length / size) || 1,
          total_articles: filtered.length,
        },
      },
    },
  };
};

export const fetchClubDetail = async (id) => {
  const found = MOCK_CLUB_ARTICLES.find(
    (a) => String(a.article_id) === String(id)
  );
  const detail = MOCK_CLUB_ARTICLE_DETAILS[id] ?? MOCK_CLUB_ARTICLE_DETAILS[201];
  return {
    ...(found ?? MOCK_CLUB_ARTICLES[0]),
    ...detail,
  };
};
