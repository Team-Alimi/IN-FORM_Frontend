import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceStore } from '@/stores/deviceStore';
import Badge from '@/components/adaptive/common/Badge';
import { getStatus } from '@/utils/statusUtil';
import { FILTER_OPTIONS } from '@/constants/filterOption';

const BookmarkItem = ({ id, category, title, source, startDate, dueDate, status, bookmarkCount, onDelete }) => {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const navigate = useNavigate();

    const handleItemClick = () => {
        navigate(`/events/detail/${id}`);
    };

    const statusInfo = getStatus(status);

    const categoryOpt = FILTER_OPTIONS.find((o) => o.key === category);
    const categoryLabel = categoryOpt?.label ?? category ?? "";
    const categoryColor = categoryOpt
        ? `${categoryOpt.tagBg} ${categoryOpt.borderColor} ${categoryOpt.textColor} border`
        : "bg-blue-100 border-blue-300 text-blue-700 border";

    if (isMobile) {
        return (
            <div
                onClick={handleItemClick}
                className="w-full bg-[#F7FAFC] rounded-[18px] px-4 py-3 mb-3 cursor-pointer shadow-[0_2px_12px_rgba(0,72,152,0.04)] relative active:scale-[0.98] transition-all"
            >
                {/* Upper Section: Badges & Delete */}
                <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2">
                        <Badge
                            text={categoryLabel}
                            color={categoryColor}
                            className="text-xs px-2 py-0.5 font-medium"
                        />
                        {statusInfo && (
                            <Badge
                                text={statusInfo.text}
                                color={`${statusInfo.color} border`}
                                className="text-xs px-2 py-0.5"
                            />
                        )}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Title */}
                <div className="font-bold text-gray-900 text-[16px] mb-1.5 leading-snug break-keep line-clamp-2">
                    {title}
                </div>

                {/* Info Section: Source, Date & Bookmark Count */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center text-gray-400 text-[14px]">
                        <span>{source}</span>
                        <span className="mx-1">•</span>
                        <span>{startDate} ~ {dueDate}</span>
                    </div>
                    <div className="text-gray-400 text-[13px]">북마크 {bookmarkCount}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleItemClick}
            className="relative p-4 md:p-6 transition-all flex flex-col gap-3 cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] hover:border-blue-200 hover:shadow-md"
        >
            {/* Upper Section */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                        <Badge
                            text={categoryLabel}
                            color={categoryColor}
                            className="text-[10px] px-2 py-0.5"
                        />
                        {statusInfo && (
                            <Badge
                                text={statusInfo.text}
                                color={`${statusInfo.color} border`}
                                className="text-[10px] px-2 py-0.5"
                            />
                        )}
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-900 leading-snug break-keep line-clamp-2">
                        {title}
                    </h3>
                </div>
                {/* Delete Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Info Section */}
            <div className="flex justify-between items-center text-[12px]">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-bold">{source}</span>
                    <span className="text-gray-400">북마크 {bookmarkCount}</span>
                </div>
                <span className="text-gray-400 font-medium">
                    {startDate} ~ {dueDate}
                </span>
            </div>
        </div>
    );
};

export default BookmarkItem;
