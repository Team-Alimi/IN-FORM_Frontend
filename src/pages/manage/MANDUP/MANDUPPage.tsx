import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import CategoryBadge from '@/components/manage/common/CategoryBadge';
import {
  getSimilarArticles,
  mergeDuplicateArticles,
} from '@/api/manage/duplicateArticles';
import type { MergeResult } from '@/api/manage/duplicateArticles';
import type { AdminArticleDetail } from '@/api/manage/articleDetail';
import { getArticleDetail } from '@/api/manage/articleDetail';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import {
  getArticleWebUrl,
  sanitizeArticleContent,
} from '@/utils/manage/articleContent';
import '@/pages/manage/MANDTR/articleDetail.css';

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: '미검수',
  READY_TO_PUBLISH: '반영대기',
  DRAFT: '임시저장',
  PUBLISHED: '운영',
  TRASHED: '휴지통',
};
const MOVED_LABELS: Record<keyof MergeResult['moved'], string> = {
  vendors: '제공처',
  bookmarks: '북마크',
  attachments: '첨부파일',
  categories: '카테고리',
  comments: '댓글',
  notifications: '알림',
};

const CompareCard = ({
  article,
  label,
  selected,
  onSelect,
  disabled,
}: {
  article: AdminArticleDetail;
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) => {
  const content = useMemo(
    () => sanitizeArticleContent(article.content ?? ''),
    [article.content]
  );
  return (
    <article
      className={`min-w-0 overflow-hidden rounded-2xl border bg-white ${selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}
    >
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
        <p className="text-xs font-semibold text-gray-500">
          {label} · #{article.id}
        </p>
        <h2 className="mt-2 break-words text-lg font-bold text-gray-900">
          {article.title}
        </h2>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-700">
          <input
            type="radio"
            name="merge-target"
            checked={selected}
            disabled={disabled || article.status === 'TRASHED'}
            onChange={onSelect}
            className="accent-blue-600"
          />
          이 공지를 남기기
        </label>
        {article.status === 'TRASHED' && (
          <p className="mt-2 text-xs text-red-600">
            휴지통의 공지는 남길 수 없습니다.
          </p>
        )}
      </div>
      <dl className="divide-y divide-gray-100 px-5 text-sm">
        <div className="grid grid-cols-[80px_1fr] gap-3 py-3">
          <dt className="text-gray-500">상태</dt>
          <dd>{STATUS_LABELS[article.status] ?? article.status}</dd>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-3 py-3">
          <dt className="text-gray-500">기간</dt>
          <dd>
            {article.starts_on ?? '미정'} ~ {article.ends_on ?? '미정'}
          </dd>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-3 py-3">
          <dt className="text-gray-500">분류</dt>
          <dd className="flex flex-wrap gap-1">
            {article.categories.length
              ? article.categories.map((category) => (
                  <CategoryBadge key={category.id} name={category.name} />
                ))
              : '미분류'}
          </dd>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-3 py-3">
          <dt className="text-gray-500">제공처</dt>
          <dd className="space-y-1">
            {article.vendors.length
              ? article.vendors.map((vendor, index) => {
                  const url = getArticleWebUrl(vendor.source_url);
                  return (
                    <div key={vendor.id ?? index}>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-blue-700 underline"
                        >
                          {vendor.vendor_name} · 원본 보기
                        </a>
                      ) : (
                        vendor.vendor_name
                      )}
                    </div>
                  );
                })
              : '없음'}
          </dd>
        </div>
      </dl>
      <section className="border-t border-gray-100 px-5 py-4">
        <h3 className="mb-3 text-sm font-bold text-gray-900">본문</h3>
        {content.trim() ? (
          <div
            className="admin-article-content break-words text-sm leading-7"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-sm text-gray-400">본문이 없습니다.</p>
        )}
      </section>
      <section className="border-t border-gray-100 px-5 py-4">
        <h3 className="mb-3 text-sm font-bold text-gray-900">
          첨부파일 ({article.attachments.length})
        </h3>
        {article.attachments.length ? (
          <ul className="space-y-2 text-sm">
            {article.attachments.map((attachment, index) => {
              const url = getArticleWebUrl(attachment.file_url);
              const name = attachment.original_name || `첨부파일 ${index + 1}`;
              return (
                <li key={attachment.id ?? index}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-700 underline"
                    >
                      {name}
                    </a>
                  ) : (
                    <span>{name} · 링크를 열 수 없습니다.</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">첨부파일이 없습니다.</p>
        )}
      </section>
    </article>
  );
};

const MANDUPPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const articleId = Number(id);
  const validId =
    !!id &&
    /^\d+$/.test(id) &&
    Number.isSafeInteger(articleId) &&
    articleId > 0;
  const otherParam = searchParams.get('other');
  const manual = searchParams.has('manual') || otherParam !== null;
  const otherId = Number(otherParam);
  const validOtherId =
    otherParam !== null &&
    /^\d+$/.test(otherParam) &&
    Number.isSafeInteger(otherId) &&
    otherId > 0 &&
    otherId !== articleId;
  const [otherInput, setOtherInput] = useState(otherParam ?? '');
  const [targetId, setTargetId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [result, setResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const queryClient = useQueryClient();
  const comparison = useQuery({
    queryKey: ['adminArticleSimilar', articleId],
    queryFn: () => getSimilarArticles(articleId),
    enabled: validId && !manual,
    retry: shouldRetryDashboardQuery,
  });
  const firstDetail = useQuery({
    queryKey: ['adminArticleDetail', articleId],
    queryFn: () => getArticleDetail(articleId),
    enabled: validId && manual,
    retry: shouldRetryDashboardQuery,
  });
  const secondDetail = useQuery({
    queryKey: ['adminArticleDetail', otherId],
    queryFn: () => getArticleDetail(otherId),
    enabled: validId && manual && validOtherId,
    retry: shouldRetryDashboardQuery,
  });
  const article = manual ? firstDetail.data : comparison.data?.article;
  const similar = manual ? secondDetail.data : comparison.data?.similar;
  const loading = manual
    ? firstDetail.isPending || (validOtherId && secondDetail.isPending)
    : comparison.isPending;
  const loadError = manual
    ? firstDetail.error || (validOtherId ? secondDetail.error : null)
    : comparison.error;
  useEffect(() => {
    setOtherInput(otherParam ?? '');
    setTargetId(null);
    setResult(null);
    setError('');
  }, [otherParam, articleId]);
  const sourceId = targetId === article?.id ? similar?.id : article?.id;
  const incompatible =
    !!article && !!similar && article.source_type !== similar.source_type;
  const mutation = useMutation({
    mutationFn: () => mergeDuplicateArticles(targetId!, sourceId!),
    onSuccess: (data) => {
      setResult(data);
      setConfirming(false);
      setError('');
      [
        'adminArticleDetail',
        'adminArticleSimilar',
        'adminDashboard',
        'adminArticles',
        'adminArticleCounts',
        'adminEditor',
        'monthlyAll',
        'events',
        'eventDetail',
        'hotEvents',
        'bookmarks',
        'notifications',
        'notificationsUnreadCount',
      ].forEach(
        (key) =>
          void queryClient.invalidateQueries({
            queryKey: [key],
            refetchType: 'none',
          })
      );
    },
    onError: (cause) => {
      setConfirming(false);
      setConfirmation('');
      setError(
        isAxiosError(cause) &&
          typeof cause.response?.data?.error?.message === 'string'
          ? cause.response.data.error.message
          : '병합하지 못했습니다. 두 공지의 상태를 다시 확인해 주세요.'
      );
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  const handleMerge = () => {
    if (
      submitting.current ||
      confirmation !== '병합' ||
      !targetId ||
      !sourceId ||
      incompatible
    )
      return;
    submitting.current = true;
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-800">
      <ManageNavigation />
      <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-8 max-mobile:px-4">
        <Link
          to={`/manage/detail/${id}`}
          className="text-sm text-gray-600 underline"
        >
          ← 게시글 상세로
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-black">게시글 비교·병합</h1>
        <p className="mt-2 text-sm text-gray-600">
          내용과 출처를 비교한 뒤 남길 공지를 선택하세요. 흡수되는 공지는 영구
          삭제됩니다.
        </p>
        <form
          className="mt-5 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const next = Number(otherInput);
            if (
              !/^\d+$/.test(otherInput) ||
              !Number.isSafeInteger(next) ||
              next <= 0 ||
              next === articleId
            ) {
              setError('비교할 다른 게시글의 올바른 ID를 입력해 주세요.');
              return;
            }
            setError('');
            setSearchParams({ other: String(next) });
          }}
        >
          <label className="text-sm font-semibold">
            비교할 다른 게시글 ID
            <input
              type="text"
              inputMode="numeric"
              value={otherInput}
              onChange={(event) => setOtherInput(event.target.value)}
              className="mt-2 block w-44 rounded-lg border border-gray-300 px-3 py-2"
              placeholder="게시글 ID"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            두 글 비교
          </button>
        </form>
        {error && !similar && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {!validId ? (
          <p role="alert" className="mt-6 rounded-xl bg-white p-5">
            올바르지 않은 게시글 ID입니다.
          </p>
        ) : loading ? (
          <p role="status" className="mt-6 rounded-xl bg-white p-5">
            두 공지를 불러오는 중입니다.
          </p>
        ) : loadError ? (
          <div role="alert" className="mt-6 rounded-xl bg-white p-5">
            <p>
              {isDashboardForbidden(loadError)
                ? '관리자 권한을 확인해 주세요.'
                : '비교할 게시글을 불러오지 못했습니다. ID와 상태를 확인해 주세요.'}
            </p>
            <button
              type="button"
              onClick={() => {
                if (manual) {
                  void firstDetail.refetch();
                  if (validOtherId) void secondDetail.refetch();
                } else void comparison.refetch();
              }}
              className="mt-3 text-sm underline"
            >
              다시 시도
            </button>
          </div>
        ) : result ? (
          <section
            role="status"
            className="mt-6 rounded-2xl border border-green-200 bg-white p-6"
          >
            <h2 className="text-lg font-bold text-green-800">
              병합이 완료되었습니다
            </h2>
            <p className="mt-2 text-sm">
              남은 공지 #{result.target_id} · 흡수된 공지{' '}
              {result.merged.map((id) => `#${id}`).join(', ') || '없음'}
            </p>
            <h3 className="mt-5 text-sm font-semibold">옮겨진 항목</h3>
            <dl className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {(
                Object.entries(MOVED_LABELS) as [
                  keyof MergeResult['moved'],
                  string,
                ][]
              ).map(([key, label]) => (
                <div key={key} className="rounded-lg bg-gray-50 p-3">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="mt-1 font-bold">{result.moved[key]}건</dd>
                </div>
              ))}
            </dl>
            <Link
              to={`/manage/detail/${result.target_id}`}
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm text-white"
            >
              남은 공지 보기
            </Link>
          </section>
        ) : article && similar ? (
          <>
            {!manual && comparison.data?.similarity_score !== undefined && (
              <p className="mt-6 text-sm font-semibold text-blue-700">
                유사도 {comparison.data.similarity_score}점
              </p>
            )}
            {incompatible && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
              >
                학교 공지와 동아리 공지는 제공처 유형이 달라 병합할 수 없습니다.
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 items-start gap-5 max-mobile:grid-cols-1">
              <CompareCard
                article={article}
                label="기준 공지"
                selected={targetId === article.id}
                onSelect={() => setTargetId(article.id)}
                disabled={mutation.isPending || incompatible}
              />
              <CompareCard
                article={similar}
                label="비교 대상"
                selected={targetId === similar.id}
                onSelect={() => setTargetId(similar.id)}
                disabled={mutation.isPending || incompatible}
              />
            </div>
            {error && (
              <p role="alert" className="mt-5 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={!targetId || incompatible || mutation.isPending}
                onClick={() => {
                  setConfirmation('');
                  setConfirming(true);
                }}
                className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                선택한 공지로 병합
              </button>
            </div>
          </>
        ) : (
          <p
            role="status"
            className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-sm"
          >
            {manual
              ? '비교할 다른 게시글 ID를 입력해 주세요.'
              : '비교할 유사 공지가 없습니다. 상대 공지가 이미 삭제되었거나 아직 유사 판정이 되지 않았을 수 있습니다.'}
          </p>
        )}
      </main>
      {confirming && article && similar && targetId && sourceId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !mutation.isPending)
              setConfirming(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="merge-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="merge-confirm-title"
              className="text-lg font-bold text-gray-900"
            >
              중복 공지를 병합할까요?
            </h2>
            <p className="mt-4 text-sm leading-6">
              남길 공지 <strong>#{targetId}</strong>에 공지{' '}
              <strong>#{sourceId}</strong>의
              제공처·북마크·첨부파일·분류·댓글·알림을 옮깁니다.
            </p>
            <p className="mt-3 text-sm font-semibold text-red-600">
              흡수되는 공지는 영구 삭제되며 되돌릴 수 없습니다.
            </p>
            <label className="mt-5 block text-sm">
              확인하려면 <strong>병합</strong>을 입력하세요.
              <input
                autoFocus
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={mutation.isPending}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
              >
                취소
              </button>
              <button
                type="button"
                disabled={confirmation !== '병합' || mutation.isPending}
                onClick={handleMerge}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-40"
              >
                {mutation.isPending ? '병합 중…' : '병합 실행'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default MANDUPPage;
