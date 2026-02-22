import React from "react";

// 색상과 텍스트를 받아서 상태 / 카테고리를 표시하는 Badge
const Badge = ({ color, text }) => (
  <span className={`px-3 py-1 text-xs font-bold border rounded-full ${color}`}>{text}</span>
);

export default Badge;
