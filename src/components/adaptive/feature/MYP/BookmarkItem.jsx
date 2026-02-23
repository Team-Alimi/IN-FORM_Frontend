import React from 'react';
import { useDeviceStore } from '../../../../stores/deviceStore';

const BookmarkItem = ({ id, category, title, source, startDate, dueDate, onDelete }) => {
    const isMobile = useDeviceStore((state) => state.isMobile);

    return (
        <div
            onClick={() => {/* 상세 페이지 이동 로직 */ }}
            className={`
                relative p-4 transition-all flex flex-col gap-3 cursor-pointer
                ${isMobile
                    ? "bg-[#F3F6F9] rounded-[20px] active:bg-[#E2E8F0] active:scale-[0.98]"
                    : "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] hover:border-blue-200 hover:shadow-md md:p-6"
                }
            `}
        >
            {/* Upper Section */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="inline-block px-2 py-0.5 bg-blue-50 text-[#004898] text-[10px] font-bold rounded-md mb-2">
                        {category}
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-900 leading-snug break-keep line-clamp-2">
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
            <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-500 font-bold">{source}</span>
                <span className="text-gray-400 font-medium">
                    {startDate} ~ {dueDate}
                </span>
            </div>
        </div>
    );
};

export default BookmarkItem;
