import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IoClose } from 'react-icons/io5';
import { fetchAnnouncementPopups } from '@/api/main/announcements';
import BottomSheet from '@/components/main/mobile/common/BottomSheet';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  ANNOUNCEMENT_TYPES,
  COFFEE_EVENT_ANNOUNCEMENT_ID,
  COFFEE_EVENT_FORM_URL,
} from '@/constants/announcements';
import {
  hideAnnouncementForWeek,
  isAnnouncementHidden,
  readHiddenAnnouncements,
} from '@/utils/announcementPopup';

const dismissed = new Set();

const AnnouncementDialog = ({ announcement, remaining, onDismiss }) => {
  const ref = useRef(null);
  const isMobile = useDeviceStore((state) => state.isMobile);
  const isCoffeeEvent =
    announcement.type === 'EVENT' && announcement.id === COFFEE_EVENT_ANNOUNCEMENT_ID;
  // 기존 커피 공지의 참여 URL 문단은 버튼으로 대체한다.
  const body = isCoffeeEvent
    ? (announcement.content ?? '').replace(/(?:참여하러\s*가기|참여하기)\s*:\s*https?:\/\/\S+/g, '').replace(/^\s*https?:\/\/\S+\s*$/gm, '').trim()
    : announcement.content;
  useEffect(() => {
    if (isMobile) return;
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus?.();
    };
  }, [isMobile]);
  const content = (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      {!isMobile && (
        <button
          type="button"
          autoFocus
          aria-label="공지 닫기"
          onClick={() => onDismiss(false)}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-black/5"
        >
          <IoClose size={24} />
        </button>
      )}
      {announcement.image_url && (
        <img
          src={announcement.image_url}
          alt={`${announcement.title} 대표 이미지`}
          className={isMobile
            ? 'mb-4 -mx-6 h-52 w-[calc(100%+3rem)] max-w-none object-cover'
            : 'mb-4 h-52 w-full object-cover'}
        />
      )}
      <div className={isMobile ? 'pb-3 text-center' : 'px-5 pb-3 pt-6 pr-14'}>
        <h2
          id="announcement-title"
          className="whitespace-pre-wrap break-words text-xl font-bold leading-snug"
        >
          {announcement.title}
        </h2>
      </div>
      <div className={isMobile ? 'pb-1 text-center' : 'px-5 pb-4'}>
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
          {body}
        </p>
        {isCoffeeEvent && (
          <a
            href={COFFEE_EVENT_FORM_URL}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            피드백 참여하기
          </a>
        )}
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
          <button
            type="button"
            onClick={() => onDismiss(true)}
            className="py-2 underline underline-offset-4"
          >
            7일간 보지 않기
          </button>
          <button
            type="button"
            onClick={() => onDismiss(false)}
            className="px-2 py-2"
          >
            {remaining > 1 ? `다음 공지 (${remaining - 1}개)` : '닫기'}
          </button>
        </div>
      </div>
    </div>
  );
  if (isMobile)
    return (
      <BottomSheet isOpen onClose={() => onDismiss(false)} className="bg-white">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-title"
        >
          <p className="mb-5 font-bold text-gray-900">
            {ANNOUNCEMENT_TYPES[announcement.type] || 'IN:FORM'}
          </p>
          {content}
        </div>
      </BottomSheet>
    );
  return (
    <dialog
      ref={ref}
      aria-labelledby="announcement-title"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss(false);
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-[360px] max-h-[80svh] overflow-y-auto rounded-2xl border-0 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/45"
    >
      {content}
    </dialog>
  );
};

const AnnouncementPopup = () => {
  const [closed, setClosed] = useState(() => new Set(dismissed));
  const [hidden] = useState(readHiddenAnnouncements);
  const query = useQuery({
    queryKey: ['announcementPopups'],
    queryFn: ({ signal }) => fetchAnnouncementPopups(signal),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const available = (query.data ?? []).filter(
    (item) => !closed.has(item.id) && !isAnnouncementHidden(item.id, hidden)
  );
  const current = available[0];
  const handleDismiss = (week) => {
    if (week) hideAnnouncementForWeek(current.id);
    dismissed.add(current.id);
    setClosed((previous) => new Set([...previous, current.id]));
  };
  // A notice fetch failure must not block the home page.
  if (!current) return null;
  return (
    <AnnouncementDialog
      key={current.id}
      announcement={current}
      remaining={available.length}
      onDismiss={handleDismiss}
    />
  );
};
export default AnnouncementPopup;
