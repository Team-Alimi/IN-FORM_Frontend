// 카테고리 한글명 → 배지/필터 색상 매핑
// GET /api/v1/categories 의 name 값과 1:1 대응 (고정값, 변경 시 관리자 설정 변경)
// 색상은 global.css의 --color-category-* 토큰을 Tailwind 클래스로 사용
export const CATEGORY_NAME_COLOR_MAP = {
  "학사":        { bg: "bg-category-academic-bg",      text: "text-category-academic-text",      border: "border-category-academic-border",      dot: "bg-category-academic-dot" },
  "대외활동":    { bg: "bg-category-activity-bg",      text: "text-category-activity-text",      border: "border-category-activity-border",      dot: "bg-category-activity-dot" },
  "취업·인턴십": { bg: "bg-category-career-bg",        text: "text-category-career-text",        border: "border-category-career-border",        dot: "bg-category-career-dot" },
  "자격증":      { bg: "bg-category-certification-bg", text: "text-category-certification-text", border: "border-category-certification-border", dot: "bg-category-certification-dot" },
  "공모전·대회": { bg: "bg-category-contest-bg",       text: "text-category-contest-text",       border: "border-category-contest-border",       dot: "bg-category-contest-dot" },
  "행사·축제":   { bg: "bg-category-event-bg",         text: "text-category-event-text",         border: "border-category-event-border",         dot: "bg-category-event-dot" },
  "어학":        { bg: "bg-category-foreign-bg",       text: "text-category-foreign-text",       border: "border-category-foreign-border",       dot: "bg-category-foreign-dot" },
  "특강·세미나": { bg: "bg-category-lecture-bg",       text: "text-category-lecture-text",       border: "border-category-lecture-border",       dot: "bg-category-lecture-dot" },
  "학술·연구":   { bg: "bg-category-research-bg",      text: "text-category-research-text",      border: "border-category-research-border",      dot: "bg-category-research-dot" },
  "장학금":      { bg: "bg-category-scholarship-bg",   text: "text-category-scholarship-text",   border: "border-category-scholarship-border",   dot: "bg-category-scholarship-dot" },
  "봉사활동":    { bg: "bg-category-volunteer-bg",     text: "text-category-volunteer-text",     border: "border-category-volunteer-border",     dot: "bg-category-volunteer-dot" },
  "기타":        { bg: "bg-category-etc-bg",           text: "text-category-etc-text",           border: "border-category-etc-border",           dot: "bg-category-etc-dot" },
};

// 매핑에 없는 카테고리의 기본 색상
export const DEFAULT_CATEGORY_COLOR = {
  bg: "bg-category-etc-bg", text: "text-category-etc-text", border: "border-category-etc-border", dot: "bg-category-etc-dot",
};

// articles API가 영어 코드를 반환할 때 한글명으로 변환
// code는 내부 AI 분류 키로, 향후 백엔드가 name(한글)만 반환하면 이 맵은 통과(no-op)됨
export const CATEGORY_CODE_TO_NAME_MAP = {
  ACADEMIC:     "학사",
  ACTIVITY:     "대외활동",
  CAREER:       "취업·인턴십",
  CERTIFICATION:"자격증",
  CONTEST:      "공모전·대회",
  EVENT:        "행사·축제",
  FOREIGN:      "어학",
  LECTURE:      "특강·세미나",
  RESEARCH:     "학술·연구",
  SCHOLARSHIP:  "장학금",
  SCHOLAR:      "장학금",
  VOLUNTEER:    "봉사활동",
  ETC:          "기타",
  RECRUIT:      "채용",
};

export const STATE_OPTIONS = [
  {
    key: "OnGoing",
    backgroundColor: "bg-[color:var(--color-OnGoing)]",
    textColor: "text-[color:var(--color-OnGoingText)]",
    borderColor: "border-[color:var(--color-OnGoingText)]",
  },
  {
    key: "Ended",
    backgroundColor: "bg-[color:var(--color-Ended)]",
    textColor: "text-[color:var(--color-EndedText)]",
    borderColor: "border-[color:var(--color-EndedText)]",
  },
  {
    key: "UpComing",
    backgroundColor: "bg-[color:var(--color-UpComing)]",
    textColor: "text-[color:var(--color-UpComingText)]",
    borderColor: "border-[color:var(--color-UpComingText)]",
  },
  {
    key: "EndingSoon",
    backgroundColor: "bg-[color:var(--color-EndingSoon)]",
    textColor: "text-[color:var(--color-EndingSoonText)]",
    borderColor: "border-[color:var(--color-EndingSoonText)]",
  },
];
