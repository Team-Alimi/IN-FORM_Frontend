import React from "react";

const ClubRow = ({ title, date, attachment_url, onClick }) => {
  return (
    <div
      className="w-full flex flex-col cursor-pointer group bg-gray-300 p-5 rounded-lg shadow-sm hover:bg-gray-500 transition-colors"
      onClick={onClick}
    >
      <div className="w-full aspect-[4/5] bg-gray-200 overflow-hidden relative rounded-lg">
        {attachment_url ? (
          <img
            src={attachment_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // 이미지 없을 때
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
      </div>

      <div className="w-full flex justify-between items-center pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-white font-bold text-lg leading-none">
            {title}
          </span>
          <span className="text-gray-100 text-sm font-light">
            {date}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClubRow;