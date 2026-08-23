export const FILTER_OPTIONS = [
  {
    key: "CONTEST",
    category_id: 1,
    label: "대회/공모전",
    color: "bg-contest/65",
    tagBg: "bg-contest/10",
    textColor: "text-contest",
    borderColor: "border-contest",
  },
  {
    key: "LECTURE",
    category_id: 2,
    label: "특강",
    color: "bg-lecture/65",
    tagBg: "bg-lecture/10",
    textColor: "text-lecture",
    borderColor: "border-lecture",
  },
  {
    key: "SCHOLAR",
    category_id: 3,
    label: "장학",
    color: "bg-scholar/65",
    tagBg: "bg-scholar/10",
    textColor: "text-scholar",
    borderColor: "border-scholar",
  },
  {
    key: "ACTIVITY",
    category_id: 4,
    label: "대내외활동",
    color: "bg-activity/65",
    tagBg: "bg-activity/10",
    textColor: "text-activity",
    borderColor: "border-activity",
  },
  {
    key: "MY",
    category_id: null,
    label: "북마크",
    color: "bg-my/65",
    tagBg: "bg-my/10",
    textColor: "text-my",
    borderColor: "border-my",
  },
];

// 새 UI 카테고리 배지 맵 (Badge category prop에서 사용)
// key는 백엔드 category_name 확정 후 Step 3에서 업데이트 예정
export const CATEGORY_BADGE_MAP = {
  공모전: { label: "공모전", bg: "bg-contest/10", text: "text-contest" },
  학사일정: { label: "학사 일정", bg: "bg-lecture/10", text: "text-lecture" },
  장학금: { label: "장학금", bg: "bg-scholar/10", text: "text-scholar" },
  동아리: { label: "동아리", bg: "bg-activity/10", text: "text-activity" },
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
