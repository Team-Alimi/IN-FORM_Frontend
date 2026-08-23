import { CATEGORY_BADGE_MAP } from "@/constants/filterOption";

// category: CATEGORY_BADGE_MAP에서 배경색·텍스트색·라벨 자동 결정
// hasOwnProperty로 프로토타입 체인 상속 속성(toString 등)과 구분
const Badge = ({ color, text, category, className }) => {
  const resolved =
    category && Object.prototype.hasOwnProperty.call(CATEGORY_BADGE_MAP, category)
      ? CATEGORY_BADGE_MAP[category]
      : null;
  const bgClass = resolved ? resolved.bg : color;
  const textClass = resolved ? resolved.text : "";
  const label = resolved ? resolved.label : text;

  return (
    <span
      className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border-0 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.03)] ${bgClass} ${textClass} ${className ?? ""}`}
    >
      {label}
    </span>
  );
};

export default Badge;
