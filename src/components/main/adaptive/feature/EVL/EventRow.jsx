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
      className="w-full bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3 mb-2.5 cursor-pointer hover:bg-gray-50 active:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge color={getBadgeColor(status)} text={status} />
          <span className="text-gray-800 text-sm">{title}</span>
        </div>
        <span className="text-gray-500 text-sm shrink-0 ml-2">{date}</span>
      </div>
    </div>
  );
};

export default EventRow;
