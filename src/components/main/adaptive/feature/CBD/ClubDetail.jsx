import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import urlIcon from "@/assets/icons/url.svg";
import { getStatus } from "@/utils/statusUtil";
import Badge from "@/components/main/adaptive/common/Badge";
import ClubImageGallery from "@/components/main/adaptive/feature/CBD/ClubImageGallery";
import { prepareClubContent } from "@/utils/clubContent";
import { getArticleClubTypes } from '@/utils/clubTypes';

// ─── 유틸 함수 ────────────────────────────────────────────────────────────────

const linkifyText = (text) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};

// ─── 이미지 뷰어 훅 ───────────────────────────────────────────────────────────

const MobileLayout = ({ title, status, vendors, startDate, dueDate, created_at, summary, bookmark_count, view_count, content, images, html }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const statusInfo = getStatus(status);

  const hashtags = getArticleClubTypes(vendors);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "동아리", url });
      } catch (err) {
        if (err.name !== "AbortError") console.error("공유 실패:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("클립보드 복사 실패:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 커버 이미지 캐러셀 + 헤더 버튼 오버레이 */}
      <ClubImageGallery images={images}>
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 h-[52px]">
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            aria-label={copied ? "링크 복사됨" : "공유하기"}
            className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M12 3v13.5m0-13.5-3 3m3-3 3 3" />
              </svg>
            )}
          </button>
        </div>
      </ClubImageGallery>

      {/* 메타 영역 */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-[22px] font-bold text-gray-900 leading-snug mb-3">{title}</h1>
        {statusInfo && (
          <div className="mb-3">
            <Badge text={statusInfo.text} color={statusInfo.color} />
          </div>
        )}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {hashtags.map((tag) => (
              <span key={tag.id} className="text-sm text-primary">#{tag.name}</span>
            ))}
          </div>
        )}

        {/* 메타 정보 */}
        <div className="mt-3 space-y-1.5 text-sm text-gray-500">
          {created_at && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 shrink-0">게시일</span>
              <span>{created_at.slice(0, 10)}</span>
            </div>
          )}
          {(startDate || dueDate) && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 shrink-0">기간</span>
              <span>
                {startDate && dueDate
                  ? `${startDate} ~ ${dueDate}`
                  : startDate || dueDate}
              </span>
            </div>
          )}
          {(view_count != null || bookmark_count != null) && (
            <div className="flex items-center gap-3">
              {view_count != null && (
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {view_count.toLocaleString()}
                </span>
              )}
              {bookmark_count != null && (
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {bookmark_count}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-100" />

      {/* AI 요약 */}
      {summary && (
        <div className="px-5 pt-5">
          <div className="px-4 py-3.5 bg-blue-50 rounded-2xl">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
              AI 요약
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* 본문 */}
      <div className="px-5 py-5">
        {html ? (
          <div
            className="prose max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">
            {linkifyText(content)}
          </div>
        )}
      </div>

    </div>
  );
};

// ─── 데스크톱 레이아웃 ────────────────────────────────────────────────────────

const DesktopLayout = ({ title, status, vendors, startDate, dueDate, created_at, summary, bookmark_count, view_count, content, linkUrl, images, html }) => {
  const navigate = useNavigate();
  const statusInfo = getStatus(status);

  const mainVendor = Array.isArray(vendors) && vendors.length > 0 ? vendors[0] : null;
  const hashtags = getArticleClubTypes(vendors);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 md:px-8 pt-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-800 hover:text-gray-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          동아리
        </button>
      </div>

      {/* 헤더 */}
      <div className="p-6 md:p-8 border-b border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-4">{title}</h1>
        {statusInfo && <div className="mb-4"><Badge text={statusInfo.text} color={statusInfo.color} /></div>}
        {hashtags.length > 0 && <div className="mb-4 flex flex-wrap gap-3">
          {hashtags.map((tag) => <span key={tag.id} className="text-sm text-primary">#{tag.name}</span>)}
        </div>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          {mainVendor && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">주관:</span>
              <span>{mainVendor.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-600">게시일:</span>
            <span>{created_at?.slice(0, 10)}</span>
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
          {(view_count != null || bookmark_count != null) && (
            <>
              <div className="w-full" />
              {view_count != null && (
                <span className="flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {view_count.toLocaleString()}
                </span>
              )}
              {bookmark_count != null && (
                <span className="flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {bookmark_count}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* 본문 */}
      {images.length > 0 && <div className="mx-auto mt-6 w-full max-w-[520px]"><ClubImageGallery images={images} /></div>}

      <div className="p-6 md:p-8 min-h-[200px]">
        {summary && (
          <div className="mb-6 px-4 py-4 bg-blue-50 rounded-2xl">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
              AI 요약
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {html ? (
          <div
            className="prose max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed">
            {linkifyText(content)}
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
            className="w-full max-w-md inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm bg-primary text-white hover:bg-primary/90"
          >
            <img src={urlIcon} alt="지원 링크" className="w-5 h-5" />
            지원하러 가기
          </a>
        </div>
      )}

    </div>
  );
};

// ─── ClubDetail ───────────────────────────────────────────────────────────────

const ClubDetail = ({ isMobile, ...props }) => {
  const prepared = useMemo(() => prepareClubContent(props.content, props.attachments), [props.content, props.attachments]);
  const galleryKey = JSON.stringify(prepared.images.map((image) => image.file_url));
  if (isMobile) return <MobileLayout key={galleryKey} {...props} {...prepared} />;
  return <DesktopLayout key={galleryKey} {...props} {...prepared} />;
};

export default ClubDetail;
