import React from "react";

const StatusBadge = ({ color, text }) => (
  <span className={`px-3 py-1 text-xs font-bold border rounded-full ${color}`}>{text}</span>
);

export default StatusBadge;
