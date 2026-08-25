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
    status: "CLOSED",
    start_date: "2026-07-01",
    due_date: "2026-08-20",
    created_at: "2026-07-01T09:00:00",
    categories: { category_name: "LECTURE" },
    vendors: [{ vendor_name: "학사지원팀" }],
    bookmark_count: 42,
    view_count: 1234,
    is_bookmarked: false,
  },
  {
    article_id: 102,
    title: "2026 하계 현장실습 참여 학생 모집",
    status: "ENDING_SOON",
    start_date: "2026-07-10",
    due_date: "2026-08-28",
    created_at: "2026-07-10T10:00:00",
    categories: { category_name: "SCHOLAR" },
    vendors: [{ vendor_name: "취업지원센터" }],
    bookmark_count: 27,
    view_count: 856,
    is_bookmarked: true,
  },
  {
    article_id: 103,
    title: "교내 소프트웨어 해커톤 참가자 모집",
    status: "OPEN",
    start_date: "2026-07-15",
    due_date: "2026-08-30",
    created_at: "2026-07-15T11:00:00",
    categories: { category_name: "CONTEST" },
    vendors: [{ vendor_name: "컴퓨터공학과" }],
    bookmark_count: 35,
    view_count: 2341,
    is_bookmarked: false,
  },
  {
    article_id: 104,
    title: "도서관 하계방학 운영시간 변경 안내",
    status: "ENDING_SOON",
    start_date: "2026-07-20",
    due_date: "2026-08-27",
    created_at: "2026-07-20T09:00:00",
    categories: { category_name: "ACTIVITY" },
    vendors: [{ vendor_name: "도서관" }],
    bookmark_count: 18,
    view_count: 412,
    is_bookmarked: false,
  },
  {
    article_id: 105,
    title: "2026년 하반기 교내 인턴십 모집 공고",
    status: "OPEN",
    start_date: "2026-07-22",
    due_date: "2026-09-01",
    created_at: "2026-07-22T10:30:00",
    categories: { category_name: "SCHOLAR" },
    vendors: [{ vendor_name: "취업지원센터" }],
    bookmark_count: 53,
    view_count: 3021,
    is_bookmarked: false,
  },
  {
    article_id: 106,
    title: "교내 건강검진 실시 안내",
    status: "CLOSED",
    start_date: "2026-06-01",
    due_date: "2026-07-15",
    created_at: "2026-06-01T08:00:00",
    categories: { category_name: "ACTIVITY" },
    vendors: [{ vendor_name: "학생처" }],
    bookmark_count: 11,
    view_count: 289,
    is_bookmarked: false,
  },
  {
    article_id: 107,
    title: "제7회 창업 아이디어 공모전 안내",
    status: "OPEN",
    start_date: "2026-07-25",
    due_date: "2026-09-10",
    created_at: "2026-07-25T09:00:00",
    categories: { category_name: "CONTEST" },
    vendors: [{ vendor_name: "창업지원단" }],
    bookmark_count: 40,
    view_count: 1876,
    is_bookmarked: true,
  },
  {
    article_id: 108,
    title: "외국어교육원 집중 어학과정 수강생 모집",
    status: "UPCOMING",
    start_date: "2026-09-01",
    due_date: "2026-09-20",
    created_at: "2026-07-28T10:00:00",
    categories: { category_name: "LECTURE" },
    vendors: [{ vendor_name: "외국어교육원" }],
    bookmark_count: 22,
    view_count: 634,
    is_bookmarked: false,
  },
];

// 공지사항 상세 - ID를 key로 하는 맵 (fetchEventDetail 용)
// content, attachments 등 목록에는 없는 상세 전용 필드만 포함
export const MOCK_SCHOOL_ARTICLE_DETAILS = {
  101: {
    content:
      "2026학년도 1학기 수강신청이 아래와 같이 진행됩니다.\n\n[수강신청 일정]\n- 수강신청 기간: 2026.08.01 ~ 2026.08.10\n- 수강변경 기간: 2026.08.15 ~ 2026.08.20\n\n[유의사항]\n1. 수강신청 전 교과과정을 반드시 확인하시기 바랍니다.\n2. 시간표 중복 등록 시 자동으로 취소됩니다.\n3. 문의사항은 학사지원팀(내선 1234)으로 연락 바랍니다.",
    attachments: [],
  },
  102: {
    content:
      "2026년 하계 현장실습 참여 학생을 모집합니다.\n\n[모집 기간]\n2026.07.10 ~ 2026.08.10\n\n[지원 자격]\n- 2학년 이상 재학생\n- 전공 관련 기업 또는 기관에서 4주 이상 실습 가능한 자\n\n[신청 방법]\n취업지원센터 방문 또는 온라인 신청서 제출\n\n문의: 취업지원센터 (내선 2345)",
    attachments: [],
  },
  103: {
    content:
      "교내 소프트웨어 해커톤에 참가자를 모집합니다.\n\n[행사 일정]\n- 접수: 2026.07.15 ~ 2026.08.15\n- 본선: 2026.08.28 ~ 2026.08.30 (2박 3일)\n\n[참가 자격]\n재학생 누구나 (1~4인 팀 구성)\n\n[시상]\n- 대상: 100만원 (1팀)\n- 최우수상: 50만원 (2팀)\n- 우수상: 30만원 (3팀)\n\n문의: 컴퓨터공학과 사무실",
    attachments: [],
  },
  104: {
    content:
      "하계방학 기간 도서관 운영시간이 아래와 같이 변경됩니다.\n\n[변경 운영 시간]\n- 평일: 09:00 ~ 18:00\n- 토요일: 09:00 ~ 14:00\n- 일요일 및 공휴일: 휴관\n\n[기간]\n2026.07.20 ~ 2026.08.25\n\n이용에 불편을 드려 죄송합니다.",
    attachments: [],
  },
  105: {
    content:
      "2026년 하반기 교내 인턴십 참여 학생을 모집합니다.\n\n[참여 기업 분야]\n- IT / 소프트웨어\n- 경영 / 마케팅\n- 디자인 / 콘텐츠\n\n[모집 기간]\n2026.07.22 ~ 2026.09.01\n\n[지원 방법]\n취업지원센터 홈페이지에서 온라인 지원\n\n[혜택]\n- 학점 인정 가능\n- 인턴십 장학금 지급 (최대 100만원)\n\n문의: 취업지원센터 (내선 2345)",
    attachments: [],
  },
  106: {
    content:
      "2026년 교내 건강검진이 아래와 같이 실시되었습니다.\n\n[검진 기간]\n2026.06.01 ~ 2026.07.15\n\n[검진 항목]\n- 기본 신체검사\n- 혈액 검사\n- 흉부 X-ray\n\n검진을 받지 못한 학생은 가까운 지정 의료기관을 이용해 주세요.\n\n문의: 학생처 (내선 3456)",
    attachments: [],
  },
  107: {
    content:
      "제7회 창업 아이디어 공모전을 개최합니다.\n\n[접수 기간]\n2026.07.25 ~ 2026.09.10\n\n[참가 자격]\n재학생 및 졸업 1년 이내 졸업생 (1~5인 팀)\n\n[심사 기준]\n- 아이디어 독창성 30%\n- 시장성 및 실현 가능성 40%\n- 발표 능력 30%\n\n[시상 내역]\n- 대상 (1팀): 500만원 + 창업 인큐베이팅 지원\n- 금상 (2팀): 200만원\n- 은상 (3팀): 100만원\n\n문의: 창업지원단 (내선 5678)",
    attachments: [],
  },
  108: {
    content:
      "외국어교육원 하계 집중 어학과정 수강생을 모집합니다.\n\n[개설 과정]\n- 영어 집중 회화 (초·중·고급)\n- 일본어 기초\n- 중국어 기초\n\n[수강 기간]\n2026.08.10 ~ 2026.08.31 (3주)\n\n[수강료]\n과정당 15만원 (장학금 지원 가능)\n\n[접수 기간]\n2026.07.28 ~ 2026.08.08\n\n문의: 외국어교육원 (내선 6789)",
    attachments: [],
  },
};

// ─── 인기 공지사항 (Hot) ────────────────────────────────────────────────────────

export const MOCK_HOT_ARTICLES = [
  {
    article_id: 105,
    categories: { category_name: "SCHOLAR" },
    title: "2026년 하반기 교내 인턴십 모집 공고",
  },
  {
    article_id: 101,
    categories: { category_name: "LECTURE" },
    title: "2026학년도 1학기 수강신청 안내",
  },
  {
    article_id: 107,
    categories: { category_name: "CONTEST" },
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

// 동아리 상세 - ID를 key로 하는 맵 (fetchClubDetail 용)
// content, original_url, attachments 등 상세 전용 필드만 포함
export const MOCK_CLUB_ARTICLE_DETAILS = {
  201: {
    content:
      "안녕하세요! 디자인 연구회에서 UX/UI 스터디 멤버를 모집합니다.\n\n[모집 대상]\n- UX/UI 디자인에 관심 있는 재학생 누구나\n- Figma 기초 사용법을 알고 있는 분\n\n[활동 내용]\n1. 매주 화/목 오후 6시 정기 모임\n2. 포트폴리오 제작 지원\n3. 디자인 챌린지 참여\n\n[지원 방법]\n구글 폼을 통해 지원해주세요.",
    original_url: "https://forms.gle/example",
    attachments: [],
  },
  202: {
    content:
      "ICPC 알고리즘 팀에서 신규 스터디 멤버를 모집합니다.\n\n[모집 대상]\n- 알고리즘 문제 풀이에 관심 있는 재학생\n- 주 2회 이상 참여 가능한 분\n\n[스터디 방식]\n1. 매주 월/수 오후 7시 온·오프라인 병행\n2. BOJ, Codeforces 문제 풀이 및 해설\n3. 교내외 대회 참가 지원\n\n[지원 방법]\n오픈채팅방 참여 후 신청서 제출",
    original_url: null,
    attachments: [],
  },
  203: {
    content:
      "락밴드 BEAT에서 신입 부원을 모집합니다!\n\n[오디션 일정]\n2026.08.01 ~ 2026.08.05 (사전 신청 필수)\n\n[모집 파트]\n- 보컬\n- 기타 (일렉/베이스)\n- 드럼\n- 키보드\n\n[자격 요건]\n파트별 6개월 이상 경력자 (초보자 지원 불가)\n\n[활동 내용]\n매주 토요일 오후 2시 정기 합주, 연 2회 공연 참가",
    original_url: null,
    attachments: [],
  },
  204: {
    content:
      "AI 연구 동아리에서 인공지능 프로젝트팀 팀원을 모집합니다.\n\n[프로젝트 주제]\n- 자연어 처리 (NLP) 기반 챗봇 개발\n- 컴퓨터 비전 이미지 분류 모델\n\n[모집 인원]\n각 팀당 3~5명\n\n[지원 자격]\n- Python 기본 문법 이해\n- PyTorch 또는 TensorFlow 사용 경험 우대\n\n[활동 기간]\n2026.08.01 ~ 2026.12.31 (5개월)\n\n[지원 방법]\n이메일로 이력서 및 포트폴리오 제출",
    original_url: "mailto:ai.club@example.com",
    attachments: [],
  },
};

// ─── 북마크 ─────────────────────────────────────────────────────────────────────

export const MOCK_BOOKMARKS = [
  {
    article_id: 102,
    title: "2026 하계 현장실습 참여 학생 모집",
    categories: { category_name: "SCHOLAR" },
    vendors: [{ vendor_name: "취업지원센터" }],
    start_date: "2026-07-10",
    due_date: "2026-08-28",
    status: "ENDING_SOON",
    bookmark_count: 27,
  },
  {
    article_id: 107,
    title: "제7회 창업 아이디어 공모전 안내",
    categories: { category_name: "CONTEST" },
    vendors: [{ vendor_name: "창업지원단" }],
    start_date: "2026-07-25",
    due_date: "2026-09-10",
    status: "OPEN",
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
