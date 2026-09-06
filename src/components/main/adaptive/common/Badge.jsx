import { CATEGORY_NAME_COLOR_MAP, CATEGORY_CODE_TO_NAME_MAP, DEFAULT_CATEGORY_COLOR } from "@/constants/filterOption";

// category: 카테고리명 (한글 또는 영어 코드). 영어 코드는 자동으로 한글명으로 변환
// color: category 없을 때 직접 지정하는 bg 클래스
const Badge = ({ color, text, category, className }) => {
  // 영어 코드("SCHOLAR" 등) → 한글명("장학금")으로 변환. 이미 한글이면 그대로 통과
  const resolvedName = category ? (CATEGORY_CODE_TO_NAME_MAP[category] ?? category) : null;
  const colorInfo = resolvedName ? (CATEGORY_NAME_COLOR_MAP[resolvedName] ?? DEFAULT_CATEGORY_COLOR) : null;
  const bgClass = colorInfo ? colorInfo.bg : (color ?? "bg-gray-100");
  const textClass = colorInfo ? colorInfo.text : "";
  const label = resolvedName ?? text;

  return (
    <span
      className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border-0 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.03)] ${bgClass} ${textClass} ${className ?? ""}`}
    >
      {label}
    </span>
  );
};

export default Badge;
