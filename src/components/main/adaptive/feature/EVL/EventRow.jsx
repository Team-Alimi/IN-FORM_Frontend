import React from "react";
import Badge from "@/components/main/adaptive/common/Badge";
import { STATE_OPTIONS } from "@/constants/filterOption";

const STATUS_KEY_MAP = {
  진행중: "OnGoing",
  마감임박: "EndingSoon",
  예정: "UpComing",
  마감: "Ended",
};

const EventRow = ({ status, title, date, onClick }) => {
  const getBadgeColor = (status) => {
    const key = STATUS_KEY_MAP[status];
    const opt = STATE_OPTIONS.find((o) => o.key === key);
    if (!opt) return "bg-gray-100 text-gray-500 border-gray-300 border";
    return `${opt.backgroundColor} ${opt.textColor} ${opt.borderColor} border`;
  };

  return (
    <div
      className="w-full cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Badge color={getBadgeColor(status)} text={status} />
          <span className="text-gray-800 text-sm">{title}</span>
        </div>
        <span className="text-gray-500 text-sm">{date}</span>
      </div>
      <div className="border-b border-gray-200" />
    </div>
  );
};

export default EventRow;
