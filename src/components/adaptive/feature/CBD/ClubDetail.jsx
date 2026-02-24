import urlIcon from "../../../../assets/icons/url.svg";

const isHTML = (str) => str && /<[a-z][\s\S]*>/i.test(str);

const ClubDetail = ({ title, vendors, startDate, dueDate, created_at, content, linkUrl, attachments }) => {
  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;


  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="p-6 md:p-8 border-b border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-4">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          {mainVendor && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">주관:</span>
              <span>{mainVendor.vendor_name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-600">게시일:</span>
            <span>{created_at}</span>
          </div>
          <div className="w-full" />
          {startDate && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">시작일:</span>
              <span>{startDate}</span>
            </div>
          )}
          {dueDate && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">마감일:</span>
              <span>{dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="p-6 md:p-8 min-h-[200px]">
        {isHTML(content) ? (
          <div
            className="prose max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        )}

        {/* 첨부 이미지 */}
        {(attachments || []).length > 0 && (
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {(attachments || []).map((a) => (
              <img
                key={a.file_id}
                src={a.file_url}
                alt={`첨부파일 ${a.file_id}`}
                className="h-64 w-auto shrink-0 rounded-xl border border-gray-100 object-contain snap-start"
              />
            ))}
          </div>
        )}
      </div>

      {/* 원문 링크 */}
      {linkUrl && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm text-m bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <img src={urlIcon} alt="원문 링크" className="w-5 h-5" />
            원문 보러가기
          </a>
        </div>
      )}
    </div>
  );
};

export default ClubDetail;
