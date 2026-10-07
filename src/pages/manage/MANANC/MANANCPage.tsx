import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import {
  getAdminAnnouncements,
  saveAnnouncement,
  transitionAnnouncement,
} from '@/api/manage/announcements';
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementType,
} from '@/api/manage/announcements';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import {
  ANNOUNCEMENT_TYPES,
} from '@/constants/announcements';

const STATUS = { DRAFT: '임시저장', PUBLISHED: '발행', ARCHIVED: '보관' };
const INPUT =
  'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm';
const errorMessage = (error: unknown) =>
  isAxiosError(error)
    ? error.response?.data?.error?.message ||
      '요청에 실패했습니다. 다시 시도해 주세요.'
    : '요청에 실패했습니다.';

const AnnouncementEditor = ({
  original,
  onClose,
  onSaved,
}: {
  original: Announcement | null;
  onClose: () => void;
  onSaved: (value: Announcement) => void;
}) => {
  const [form, setForm] = useState({
    type: original?.type ?? ('EVENT' as AnnouncementType),
    title: original?.title ?? '',
    content: original?.content ?? '',
    is_popup: original?.is_popup ?? true,
    starts_on: original?.starts_on ?? '',
    ends_on: original?.ends_on ?? '',
  });
  const [validation, setValidation] = useState('');
  const lock = useRef(false);
  const mutation = useMutation({
    mutationFn: (payload: AnnouncementInput) =>
      saveAnnouncement(original?.id, payload),
    onSuccess: onSaved,
  });
  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (lock.current) return;
    if (!form.title.trim() || !form.content.trim()) {
      setValidation('제목과 본문을 입력해 주세요.');
      return;
    }
    if (form.starts_on && form.ends_on && form.starts_on > form.ends_on) {
      setValidation('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }
    setValidation('');
    lock.current = true;
    const changedPeriod =
      original &&
      (form.starts_on !== (original.starts_on ?? '') ||
        form.ends_on !== (original.ends_on ?? ''));
    try {
      await mutation.mutateAsync({
        type: form.type,
        title: form.title.trim(),
        content: form.content.trim(),
        is_popup: form.is_popup,
        ...(!original ? { status: 'DRAFT' as const } : {}),
        ...(changedPeriod ? { clear_period: true } : {}),
        ...(!original || changedPeriod
          ? {
              ...(form.starts_on ? { starts_on: form.starts_on } : {}),
              ...(form.ends_on ? { ends_on: form.ends_on } : {}),
            }
          : {}),
      });
    } catch {
      /* Render mutation error below. */
    } finally {
      lock.current = false;
    }
  };
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold">
        {original ? '서비스 공지 수정' : '새 서비스 공지'}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        새 공지는 임시저장됩니다. 목록에서 발행하면 노출 기간에 맞춰 공개됩니다.
      </p>
      <form onSubmit={handleSave} className="mt-5 space-y-4">
        <fieldset
          disabled={mutation.isPending}
          className="space-y-4 disabled:opacity-60"
        >
          <label className="block text-sm">
            유형
            <select
              className={INPUT}
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as AnnouncementType })
              }
            >
              {Object.entries(ANNOUNCEMENT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            제목
            <input
              required
              maxLength={500}
              className={INPUT}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            본문
            <textarea
              required
              rows={8}
              className={INPUT}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </label>
          <p className="text-xs text-gray-500">
            텍스트와 줄바꿈만 지원합니다. 이벤트 참여 경로는 본문에 작성하세요.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_popup}
              onChange={(e) => setForm({ ...form, is_popup: e.target.checked })}
            />
            홈 진입 시 팝업으로 표시
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              노출 시작일
              <input
                type="date"
                className={INPUT}
                value={form.starts_on}
                onChange={(e) =>
                  setForm({ ...form, starts_on: e.target.value })
                }
              />
            </label>
            <label className="text-sm">
              노출 종료일
              <input
                type="date"
                className={INPUT}
                value={form.ends_on}
                min={form.starts_on || undefined}
                onChange={(e) => setForm({ ...form, ends_on: e.target.value })}
              />
            </label>
          </div>
          <p className="text-xs leading-5 text-gray-500">
            한국 시간 기준으로 시작일·종료일을 포함합니다. 비우면 기간 제한이
            없습니다. 종료일이 지나면 공지 상세도 숨겨집니다. 이미 숨긴
            사용자에게 새 내용을 알리려면 새 공지를 작성하세요.
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-black px-5 py-3 text-sm text-white"
            >
              {mutation.isPending
                ? '저장 중...'
                : original
                  ? '수정 저장'
                  : '임시저장'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-3 text-sm"
            >
              취소
            </button>
          </div>
        </fieldset>
        {(validation || mutation.isError) && (
          <p role="alert" className="text-sm text-red-600">
            {validation || errorMessage(mutation.error)}
          </p>
        )}
      </form>
    </section>
  );
};

const MANANCPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [popup, setPopup] = useState('');
  const [editing, setEditing] = useState<{ value: Announcement | null } | null>(
    null
  );
  const [saved, setSaved] = useState<Announcement | null>(null);
  const lock = useRef(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['adminAnnouncements', page, status, type, popup],
    queryFn: ({ signal }) =>
      getAdminAnnouncements(
        {
          page,
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(popup ? { is_popup: popup === 'true' } : {}),
        },
        signal
      ),
    retry: shouldRetryDashboardQuery,
  });
  const handleSaved = (value: Announcement) => {
    setSaved(value);
    setEditing(null);
    client.invalidateQueries({ queryKey: ['adminAnnouncements'] });
    client.invalidateQueries({ queryKey: ['announcementPopups'] });
  };
  const transition = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: 'publish' | 'archive';
    }) => transitionAnnouncement(id, action),
    onSuccess: handleSaved,
  });
  const handleTransition = async (
    item: Announcement,
    action: 'publish' | 'archive'
  ) => {
    if (lock.current) return;
    if (
      !window.confirm(
        action === 'publish'
          ? '이 공지를 발행할까요? 노출 기간과 팝업 설정에 따라 사용자에게 공개됩니다.'
          : '이 공지를 보관하고 사용자 화면에서 내릴까요?'
      )
    )
      return;
    lock.current = true;
    try {
      await transition.mutateAsync({ id: item.id, action });
    } catch {
      /* Render mutation error below. */
    } finally {
      lock.current = false;
    }
  };
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-900">
      <ManageNavigation />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">서비스 공지 관리</h1>
            <p className="mt-2 text-sm text-gray-500">
              점검·업데이트·이벤트를 안내하고 홈 팝업을 관리합니다.
            </p>
          </div>
          <button
            disabled={
              !!editing ||
              query.isError ||
              query.isPending ||
              transition.isPending
            }
            onClick={() => {
              setSaved(null);
              setEditing({ value: null });
            }}
            className="shrink-0 rounded-lg bg-black px-4 py-3 text-sm text-white disabled:opacity-40"
          >
            공지 작성
          </button>
        </div>
        {saved && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm"
          >
            <p>
              #{saved.id} {saved.title} · {STATUS[saved.status]} 완료
            </p>
            {(saved.warnings ?? []).map((warning, index) => (
              <p key={index} className="mt-2 text-amber-900">
                {warning}
              </p>
            ))}
          </div>
        )}
        {transition.isError && (
          <p role="alert" className="mb-4 text-red-600">
            {errorMessage(transition.error)}
          </p>
        )}
        {editing ? (
          <AnnouncementEditor
            key={editing.value?.id ?? 'new'}
            original={editing.value}
            onClose={() => setEditing(null)}
            onSaved={handleSaved}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-3">
              <select
                aria-label="상태 필터"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
              >
                <option value="">전체 상태</option>
                {Object.entries(STATUS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                aria-label="유형 필터"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
              >
                <option value="">전체 유형</option>
                {Object.entries(ANNOUNCEMENT_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                aria-label="팝업 필터"
                value={popup}
                onChange={(e) => {
                  setPopup(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
              >
                <option value="">팝업 전체</option>
                <option value="true">팝업 지정</option>
                <option value="false">팝업 미지정</option>
              </select>
            </div>
            {query.isPending ? (
              <p role="status">공지를 불러오는 중입니다...</p>
            ) : query.isError ? (
              <div role="alert" className="rounded-xl bg-white p-6">
                <p>
                  {isDashboardForbidden(query.error)
                    ? '관리자 권한이 필요합니다.'
                    : '공지 목록을 불러오지 못했습니다.'}
                </p>
                <button
                  onClick={() => query.refetch()}
                  className="mt-3 underline"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <>
                {!query.data.content.length && (
                  <p className="rounded-xl bg-white p-8 text-center text-gray-500">
                    등록된 공지가 없습니다.
                  </p>
                )}
                <div className="space-y-3">
                  {query.data.content.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>{ANNOUNCEMENT_TYPES[item.type]}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-1">
                          {STATUS[item.status]}
                        </span>
                        {item.is_popup && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                            팝업 지정
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 break-words font-bold">
                        {item.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm text-gray-500">
                        {item.content}
                      </p>
                      <p className="mt-3 text-xs text-gray-500">
                        노출: {item.starts_on || '발행 즉시'} ~{' '}
                        {item.ends_on || '계속'}
                      </p>
                      <div className="mt-4 flex gap-4 text-sm">
                        <button
                          disabled={transition.isPending}
                          onClick={() => {
                            setSaved(null);
                            transition.reset();
                            setEditing({ value: item });
                          }}
                          className="underline"
                        >
                          수정
                        </button>
                        {item.status !== 'PUBLISHED' && (
                          <button
                            disabled={transition.isPending}
                            onClick={() => handleTransition(item, 'publish')}
                            className="font-semibold text-primary"
                          >
                            발행
                          </button>
                        )}
                        {item.status !== 'ARCHIVED' && (
                          <button
                            disabled={transition.isPending}
                            onClick={() => handleTransition(item, 'archive')}
                            className="text-gray-500"
                          >
                            보관
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-6 flex justify-center gap-5 text-sm">
                  <button
                    disabled={page <= 1 || query.isFetching}
                    onClick={() => setPage(page - 1)}
                    className="disabled:opacity-30"
                  >
                    이전
                  </button>
                  <span>
                    {page} / {Math.max(1, query.data.page_info.total_pages)}
                  </span>
                  <button
                    disabled={
                      !query.data.page_info.has_next || query.isFetching
                    }
                    onClick={() => setPage(page + 1)}
                    className="disabled:opacity-30"
                  >
                    다음
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};
export default MANANCPage;
