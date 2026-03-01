import React from "react";

// 색상과 텍스트를 받아서 상태 / 카테고리를 표시하는 Badge
const Badge = ({ color, text, className }) => (
  <span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border-0 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.03)] ${color} ${className ?? ""}`}>{text}</span>
);

export default Badge;
