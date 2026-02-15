import React from "react";
import { getStatus } from "../../utils/statusUtil";

const ClubDetail = ({ title, vendor, startDate, dueDate, created_at, content, linkUrl, attachmentUrls }) => {
  const status = getStatus(startDate, dueDate);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 text-xs font-bold border rounded-full ${status.color}`}>{status.text}</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-6">{title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-800">주관:</span><span>{vendor}</span></div>
          <div className="hidden sm:block w-px h-3 bg-gray-300" />
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-800">게시일자:</span><span>{created_at}</span></div>
        </div>
      </div>
      <div className="p-6 md:p-8 min-h-[200px]">
        {attachmentUrls && attachmentUrls.length > 0 && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-3">
            {attachmentUrls.map((url, index) => (
              <div key={index} className="w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm" onClick={() => window.open(url, '_blank')}>
                <img 
                  src={url} 
                  alt={`첨부 이미지 ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}
        <div className="prose text-gray-800 whitespace-pre-line leading-relaxed">{content}</div>
      </div>
      {linkUrl && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm text-sm font-bold transition-colors">
            원문 공지 보러가기 →
          </a>
        </div>
      )}
    </div>
  );
};

export default ClubDetail;
