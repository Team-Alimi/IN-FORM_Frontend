// 카테고리 한글명 → 배지/필터 색상 매핑
// GET /api/v1/categories 의 name 값과 1:1 대응 (고정값, 변경 시 관리자 설정 변경)
// 색상 HEX 미확정 — Tailwind 임시 색상 사용 (백엔드 HEX 확정 시 업데이트)
export const CATEGORY_NAME_COLOR_MAP = {
  "학사":        { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    dot: "bg-blue-400" },
  "대외활동":    { bg: "bg-green-50",   text: "text-green-600",   border: "border-green-200",   dot: "bg-green-400" },
  "취업·인턴십": { bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-200",  dot: "bg-orange-400" },
  "자격증":      { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200",  dot: "bg-yellow-400" },
  "공모전·대회": { bg: "bg-purple-50",  text: "text-purple-600",  border: "border-purple-200",  dot: "bg-purple-400" },
  "행사·축제":   { bg: "bg-pink-50",    text: "text-pink-600",    border: "border-pink-200",    dot: "bg-pink-400" },
  "어학":        { bg: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-200",    dot: "bg-cyan-400" },
  "특강·세미나": { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-200",  dot: "bg-indigo-400" },
  "학술·연구":   { bg: "bg-teal-50",    text: "text-teal-600",    border: "border-teal-200",    dot: "bg-teal-400" },
  "장학금":      { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-400" },
  "봉사활동":    { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200",    dot: "bg-rose-400" },
  "기타":        { bg: "bg-slate-100",  text: "text-slate-500",   border: "border-slate-200",   dot: "bg-slate-400" },
};

// 매핑에 없는 카테고리의 기본 색상
export const DEFAULT_CATEGORY_COLOR = {
  bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400",
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
