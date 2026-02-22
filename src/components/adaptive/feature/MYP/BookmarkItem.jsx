import React from 'react';

const BookmarkItem = ({ id, category, title, source, startDate, dueDate, onDelete }) => {
    return (
        <div className="relative bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] mb-4 hover:border-[#0056b3]/30 hover:shadow-md transition-all group flex flex-col justify-between h-full">
            {/* Delete Button (Top Right) */}
            <button
                onClick={() => onDelete(id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                aria-label="북마크 삭제"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Content */}
            <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-blue-50 text-[#0056b3] text-[11px] md:text-[12px] font-bold rounded-full mb-3 tracking-wide">
                    {category}
                </div>

                <h3 className="text-[15px] md:text-[16px] font-bold text-gray-900 mb-4 pr-6 break-keep leading-snug">
                    {title}
                </h3>
            </div>

            {/* Footer Info */}
            <div className="flex flex-col gap-1 mt-auto">
                <span className="text-xs md:text-[13px] text-gray-500 font-semibold">{source}</span>
                <span className="text-xs md:text-[13px] text-gray-400 font-medium tracking-tight">
                    {startDate} ~ {dueDate}
                </span>
            </div>
        </div>
    );
};

export default BookmarkItem;
