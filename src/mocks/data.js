/**
 * 더미 데이터 (백엔드 없이 UI 확인용)
 * 실제 API 응답 구조와 동일하게 맞춰져 있음
 */

// ─── 사용자 정보 ────────────────────────────────────────────────────────────────

export const MOCK_USER = {
  user_id: 1,
  email: "mock_user@example.com",
  name: "테스트 유저",
  major: {
    vendor_id: 10,
    vendor_name: "컴퓨터공학과",
    vendor_type: "DEPARTMENT",
  },
};

// ─── 학교 공지사항 ───────────────────────────────────────────────────────────────

export const MOCK_SCHOOL_ARTICLES = [
  {
    article_id: 101,
    title: "2026학년도 1학기 수강신청 안내",
    status: "OnGoing",
    start_date: "2026-07-01",
    due_date: "2026-08-20",
    created_at: "2026-07-01T09:00:00",
    categories: { category_name: "ACADEMIC" },
    vendors: [{ vendor_name: "학사지원팀" }],
    bookmark_count: 42,
    is_bookmarked: false,
  },
  {
    article_id: 102,
    title: "2026 하계 현장실습 참여 학생 모집",
    status: "EndingSoon",
    start_date: "2026-07-10",
    due_date: "2026-08-10",
    created_at: "2026-07-10T10:00:00",
    categories: { category_name: "CAREER" },
    vendors: [{ vendor_name: "취업지원센터" }],
    bookmark_count: 27,
    is_bookmarked: true,
  },
  {
    article_id: 103,
    title: "교내 소프트웨어 해커톤 참가자 모집",
    status: "OnGoing",
    start_date: "2026-07-15",
    due_date: "2026-08-30",
    created_at: "2026-07-15T11:00:00",
    categories: { category_name: "COMPETITION" },
    vendors: [{ vendor_name: "컴퓨터공학과" }],
    bookmark_count: 35,
    is_bookmarked: false,
  },
  {
    article_id: 104,
    title: "도서관 하계방학 운영시간 변경 안내",
    status: "OnGoing",
    start_date: "2026-07-20",
    due_date: "2026-08-25",
    created_at: "2026-07-20T09:00:00",
    categories: { category_name: "GENERAL" },
    vendors: [{ vendor_name: "도서관" }],
    bookmark_count: 18,
    is_bookmarked: false,
  },
  {
    article_id: 105,
    title: "2026년 하반기 교내 인턴십 모집 공고",
    status: "OnGoing",
    start_date: "2026-07-22",
    due_date: "2026-09-01",
    created_at: "2026-07-22T10:30:00",
    categories: { category_name: "CAREER" },
    vendors: [{ vendor_name: "취업지원센터" }],
    bookmark_count: 53,
    is_bookmarked: false,
  },
  {
    article_id: 106,
    title: "교내 건강검진 실시 안내",
    status: "Closed",
    start_date: "2026-06-01",
    due_date: "2026-07-15",
    created_at: "2026-06-01T08:00:00",
    categories: { category_name: "GENERAL" },
    vendors: [{ vendor_name: "학생처" }],
    bookmark_count: 11,
    is_bookmarked: false,
  },
  {
    article_id: 107,
    title: "제7회 창업 아이디어 공모전 안내",
    status: "OnGoing",
    start_date: "2026-07-25",
    due_date: "2026-09-10",
    created_at: "2026-07-25T09:00:00",
    categories: { category_name: "COMPETITION" },
    vendors: [{ vendor_name: "창업지원단" }],
    bookmark_count: 40,
    is_bookmarked: true,
  },
  {
    article_id: 108,
    title: "외국어교육원 집중 어학과정 수강생 모집",
    status: "EndingSoon",
    start_date: "2026-07-28",
    due_date: "2026-08-08",
    created_at: "2026-07-28T10:00:00",
    categories: { category_name: "ACADEMIC" },
    vendors: [{ vendor_name: "외국어교육원" }],
    bookmark_count: 22,
    is_bookmarked: false,
  },
];

// 공지사항 상세 (fetchEventDetail 용)
export const MOCK_SCHOOL_ARTICLE_DETAIL = {
  article_id: 101,
  title: "2026학년도 1학기 수강신청 안내",
  status: "OnGoing",
  start_date: "2026-07-01",
  due_date: "2026-08-20",
  created_at: "2026-07-01T09:00:00",
  categories: { category_name: "ACADEMIC" },
  vendors: [{ vendor_name: "학사지원팀" }],
  bookmark_count: 42,
  is_bookmarked: false,
  content:
    "2026학년도 1학기 수강신청이 아래와 같이 진행됩니다.\n\n[수강신청 일정]\n- 수강신청 기간: 2026.08.01 ~ 2026.08.10\n- 수강변경 기간: 2026.08.15 ~ 2026.08.20\n\n[유의사항]\n1. 수강신청 전 교과과정을 반드시 확인하시기 바랍니다.\n2. 시간표 중복 등록 시 자동으로 취소됩니다.\n3. 문의사항은 학사지원팀(내선 1234)으로 연락 바랍니다.",
  attachments: [],
};

// ─── 인기 공지사항 (Hot) ────────────────────────────────────────────────────────

export const MOCK_HOT_ARTICLES = [
  {
    article_id: 105,
    categories: { category_name: "CAREER" },
    title: "2026년 하반기 교내 인턴십 모집 공고",
  },
  {
    article_id: 101,
    categories: { category_name: "ACADEMIC" },
    title: "2026학년도 1학기 수강신청 안내",
  },
  {
    article_id: 107,
    categories: { category_name: "COMPETITION" },
    title: "제7회 창업 아이디어 공모전 안내",
  },
];

// ─── 동아리 공지사항 ────────────────────────────────────────────────────────────

export const MOCK_CLUB_ARTICLES = [
  {
    article_id: 201,
    title: "UX/UI 디자인 스터디 멤버 모집",
    start_date: "2026-07-05",
    due_date: "2026-08-15",
    created_at: "2026-07-05T10:00:00",
    vendors: [{ vendor_name: "디자인 연구회" }],
    bookmark_count: 15,
    is_bookmarked: false,
  },
  {
    article_id: 202,
    title: "알고리즘 스터디 신규 멤버 모집",
    start_date: "2026-07-08",
    due_date: "2026-08-20",
    created_at: "2026-07-08T09:00:00",
    vendors: [{ vendor_name: "ICPC 알고리즘 팀" }],
    bookmark_count: 30,
    is_bookmarked: true,
  },
  {
    article_id: 203,
    title: "밴드 동아리 신입 부원 오디션 공지",
    start_date: "2026-07-10",
    due_date: "2026-08-05",
    created_at: "2026-07-10T11:00:00",
    vendors: [{ vendor_name: "락밴드 BEAT" }],
    bookmark_count: 20,
    is_bookmarked: false,
  },
  {
    article_id: 204,
    title: "인공지능 프로젝트팀 팀원 모집",
    start_date: "2026-07-12",
    due_date: "2026-08-25",
    created_at: "2026-07-12T14:00:00",
    vendors: [{ vendor_name: "AI 연구 동아리" }],
    bookmark_count: 45,
    is_bookmarked: false,
  },
];

// 동아리 상세 (fetchClubDetail 용)
export const MOCK_CLUB_ARTICLE_DETAIL = {
  article_id: 201,
  title: "UX/UI 디자인 스터디 멤버 모집",
  start_date: "2026-07-05",
  due_date: "2026-08-15",
  created_at: "2026-07-05T10:00:00",
  vendors: [{ vendor_name: "디자인 연구회" }],
  bookmark_count: 15,
  is_bookmarked: false,
  content:
    "안녕하세요! 디자인 연구회에서 UX/UI 스터디 멤버를 모집합니다.\n\n[모집 대상]\n- UX/UI 디자인에 관심 있는 재학생 누구나\n- Figma 기초 사용법을 알고 있는 분\n\n[활동 내용]\n1. 매주 화/목 오후 6시 정기 모임\n2. 포트폴리오 제작 지원\n3. 디자인 챌린지 참여\n\n[지원 방법]\n구글 폼을 통해 지원해주세요.",
  original_url: "https://forms.gle/example",
  attachments: [],
};

// ─── 캘린더 일정 ────────────────────────────────────────────────────────────────

export const MOCK_CALENDAR_ARTICLES = [
  {
    article_id: 101,
    title: "수강신청 안내",
    start_date: "2026-08-01",
    due_date: "2026-08-20",
    category_name: "ACADEMIC",
    article_type: "SCHOOL",
  },
  {
    article_id: 102,
    title: "현장실습 모집",
    start_date: "2026-08-05",
    due_date: "2026-08-10",
    category_name: "CAREER",
    article_type: "SCHOOL",
  },
  {
    article_id: 103,
    title: "해커톤 참가자 모집",
    start_date: "2026-08-12",
    due_date: "2026-08-30",
    category_name: "COMPETITION",
    article_type: "SCHOOL",
  },
  {
    article_id: 105,
    title: "교내 인턴십 모집",
    start_date: "2026-08-03",
    due_date: "2026-09-01",
    category_name: "CAREER",
    article_type: "SCHOOL",
  },
  {
    article_id: 107,
    title: "창업 공모전",
    start_date: "2026-08-18",
    due_date: "2026-09-10",
    category_name: "COMPETITION",
    article_type: "SCHOOL",
  },
];

// ─── 북마크 ─────────────────────────────────────────────────────────────────────

export const MOCK_BOOKMARKS = [
  {
    article_id: 102,
    title: "2026 하계 현장실습 참여 학생 모집",
    categories: { category_name: "CAREER" },
    vendors: [{ vendor_name: "취업지원센터" }],
    start_date: "2026-07-10",
    due_date: "2026-08-10",
    status: "EndingSoon",
    bookmark_count: 27,
  },
  {
    article_id: 107,
    title: "제7회 창업 아이디어 공모전 안내",
    categories: { category_name: "COMPETITION" },
    vendors: [{ vendor_name: "창업지원단" }],
    start_date: "2026-07-25",
    due_date: "2026-09-10",
    status: "OnGoing",
    bookmark_count: 40,
  },
];

// ─── 알림 ────────────────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS = [
  {
    notification_id: 1,
    title: "마감 임박 알림",
    message: "북마크한 '하계 현장실습 참여 학생 모집'이 3일 후 마감됩니다.",
    article_type: "SCHOOL",
    article_id: 102,
    is_read: false,
    created_at: "2026-08-04T08:00:00",
  },
  {
    notification_id: 2,
    title: "새 공지사항",
    message: "컴퓨터공학과에 새 공지사항이 등록되었습니다.",
    article_type: "SCHOOL",
    article_id: 103,
    is_read: false,
    created_at: "2026-08-03T14:30:00",
  },
  {
    notification_id: 3,
    title: "마감 임박 알림",
    message: "북마크한 '창업 아이디어 공모전'의 마감이 2주 남았습니다.",
    article_type: "SCHOOL",
    article_id: 107,
    is_read: true,
    created_at: "2026-08-01T09:00:00",
  },
];

// ─── 학과/제공처 목록 ───────────────────────────────────────────────────────────

export const MOCK_VENDORS = [
  { vendor_id: 10, vendor_name: "컴퓨터공학과", vendor_type: "DEPARTMENT" },
  { vendor_id: 11, vendor_name: "전자공학과", vendor_type: "DEPARTMENT" },
  { vendor_id: 12, vendor_name: "기계공학과", vendor_type: "DEPARTMENT" },
  { vendor_id: 13, vendor_name: "경영학과", vendor_type: "DEPARTMENT" },
  { vendor_id: 14, vendor_name: "국어국문학과", vendor_type: "DEPARTMENT" },
  { vendor_id: 20, vendor_name: "학사지원팀", vendor_type: "ORGANIZATION" },
  { vendor_id: 21, vendor_name: "취업지원센터", vendor_type: "ORGANIZATION" },
  { vendor_id: 22, vendor_name: "창업지원단", vendor_type: "ORGANIZATION" },
  { vendor_id: 23, vendor_name: "도서관", vendor_type: "ORGANIZATION" },
  { vendor_id: 24, vendor_name: "학생처", vendor_type: "ORGANIZATION" },
  { vendor_id: 25, vendor_name: "외국어교육원", vendor_type: "ORGANIZATION" },
];

// ─── 페이지 정보 ────────────────────────────────────────────────────────────────

export const MOCK_PAGE_INFO = {
  current_page: 1,
  total_pages: 2,
  total_articles: MOCK_SCHOOL_ARTICLES.length,
};

export const MOCK_CLUB_PAGE_INFO = {
  current_page: 1,
  total_pages: 1,
  total_articles: MOCK_CLUB_ARTICLES.length,
};
