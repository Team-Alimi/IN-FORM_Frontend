import React from "react";

// 색상과 텍스트를 받아서 상태 / 카테고리를 표시하는 Badge
const Badge = ({ color, text }) => (
  <span className={`shrink-0 px-2.5 py-1 text-xs font-medium border rounded-full ${color}`}>{text}</span>
);

export default Badge;
