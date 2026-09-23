import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  RiArrowLeftSLine,
  RiAttachment2,
  RiExternalLinkLine,
  RiPencilLine,
} from 'react-icons/ri';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import { getArticleDetail } from '@/api/manage/articleDetail';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import type { ReviewStatus } from '@/api/manage/dashboard';
import {
  CATEGORY_NAME_COLOR_MAP,
  DEFAULT_CATEGORY_COLOR,
} from '@/constants/filterOption';
import {
  getArticleWebUrl,
  sanitizeArticleContent,
} from '@/utils/manage/articleContent';
import './articleDetail.css';

const STATUS_BADGES: Record<ReviewStatus, { label: string; color: string }> = {
  PENDING_REVIEW: {
    label: '미검수',
    color: 'border-gray-200 bg-gray-50 text-gray-600',
  },
  READY_TO_PUBLISH: {
    label: '반영대기',
    color: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  DRAFT: {
    label: '임시저장',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  PUBLISHED: {
    label: '운영 중',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  TRASHED: { label: '휴지통', color: 'border-red-200 bg-red-50 text-red-600' },
};
const categoryColors: Record<string, { bg: string; text: string }> =
  CATEGORY_NAME_COLOR_MAP;
const formatDate = (value?: string) =>
  value ? value.slice(0, 10).replaceAll('-', '.') : '미정';
const formatUpdatedAt = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part('year')}.${part('month')}.${part('day')} ${part('hour')}:${part('minute')}:${part('second')}`;
};
const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center border-t border-gray-100 px-5 py-4 max-mobile:grid-cols-1 max-mobile:gap-2">
    <dt className="text-xs text-gray-600">{label}</dt>
    <dd className="min-w-0 break-words text-sm text-gray-900">{children}</dd>
  </div>
);

const MANDTRPage = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = Number(id);
  const validId =
    !!id &&
    /^\d+$/.test(id) &&
    Number.isSafeInteger(articleId) &&
    articleId > 0;
  const navigate = useNavigate();
  const detail = useQuery({
    queryKey: ['adminArticleDetail', articleId],
    queryFn: () => getArticleDetail(articleId),
    enabled: validId,
    retry: shouldRetryDashboardQuery,
  });
  const article = detail.data;
  const safeContent = useMemo(
    () => sanitizeArticleContent(article?.content ?? ''),
    [article?.content]
  );
  const forbidden = isDashboardForbidden(detail.error);
  const notFound =
    isAxiosError(detail.error) && detail.error.response?.status === 404;
  const status = article ? STATUS_BADGES[article.status] : undefined;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  const handleBack = () => {
    if (
      typeof window.history.state?.idx === 'number' &&
      window.history.state.idx > 0
    )
      navigate(-1);
    else navigate('/manage', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-gray-700">
      <ManageNavigation />
      <main className="mx-auto w-full max-w-[924px] flex-1 px-6 pb-16 pt-8 max-mobile:px-4 max-mobile:pb-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={handleBack}
            className="rounded-full border border-gray-200 bg-white p-1.5 shadow-sm"
          >
            <RiArrowLeftSLine size={24} />
          </button>
          <h1 className="text-[22px] font-bold text-black">게시글 상세 보기</h1>
          {article && !detail.isError && (
            <p className="ml-auto text-xs text-gray-400 max-mobile:w-full max-mobile:pl-12">
              최종 수정일:{' '}
              <time dateTime={article.updated_at}>
                {formatUpdatedAt(article.updated_at)}
              </time>
            </p>
          )}
        </div>
        {!validId ? (
          <div
            role="alert"
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            올바르지 않은 게시글 ID입니다.{' '}
            <Link to="/manage" className="underline">
              관리자 홈
            </Link>
          </div>
        ) : detail.isPending ? (
          <div
            role="status"
            className="rounded-2xl border border-gray-200 bg-white p-6 text-sm"
          >
            게시글을 불러오는 중입니다.
          </div>
        ) : detail.isError ? (
          <section
            role="alert"
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            <h2 className="font-bold text-gray-900">
              {forbidden
                ? '관리자 접근 권한을 확인해 주세요'
                : notFound
                  ? '게시글을 찾을 수 없습니다'
                  : '게시글을 불러오지 못했습니다'}
            </h2>
            <p className="mt-3 text-sm">
              {forbidden
                ? '관리자 권한이 부여된 계정으로 다시 로그인해 주세요.'
                : notFound
                  ? '삭제되었거나 다른 게시글로 병합된 게시글일 수 있습니다.'
                  : '잠시 후 다시 시도해 주세요.'}
            </p>
            <div className="mt-5 flex gap-4 text-sm">
              <Link to="/manage" className="underline">
                관리자 홈
              </Link>
              {forbidden ? (
                <Link
                  to="/login"
                  state={{ from: { pathname: `/manage/detail/${id}` } }}
                  className="underline"
                >
                  다시 로그인
                </Link>
              ) : (
                !notFound && (
                  <button
                    onClick={() => void detail.refetch()}
                    disabled={detail.isFetching}
                    className="underline disabled:opacity-40"
                  >
                    {detail.isFetching ? '불러오는 중…' : '다시 시도'}
                  </button>
                )
              )}
            </div>
          </section>
        ) : (
          article && (
            <>
              <section
                aria-label="게시글 정보"
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <h2 className="bg-[#F8F9FA] px-5 py-4 text-xs text-gray-600">
                  게시글 정보
                </h2>
                <dl>
                  <InfoRow label="게시글 ID">{article.id}</InfoRow>
                  <InfoRow label="게시글 제목">{article.title}</InfoRow>
                  <InfoRow label="카테고리">
                    <div className="flex flex-wrap gap-2">
                      {article.categories.length ? (
                        article.categories.map((category) => {
                          const colors =
                            categoryColors[category.name] ??
                            DEFAULT_CATEGORY_COLOR;
                          return (
                            <span
                              key={category.id}
                              className={`rounded-full px-3 py-1 text-xs ${colors.bg} ${colors.text}`}
                            >
                              {category.name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-400">미분류</span>
                      )}
                    </div>
                  </InfoRow>
                  <InfoRow label="출처">
                    <ul className="flex flex-wrap gap-2">
                      {article.vendors.length ? (
                        article.vendors.map((vendor, index) => {
                          const url = getArticleWebUrl(vendor.source_url);
                          const label = `${vendor.vendor_name}${vendor.external_key !== undefined ? ' · 수집 출처' : ''}`;
                          return (
                            <li key={vendor.id ?? index}>
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`${label} 원본 보기`}
                                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
                                >
                                  {vendor.vendor_name}
                                  <RiExternalLinkLine aria-hidden="true" />
                                  <span className="sr-only">
                                    {vendor.external_key !== undefined
                                      ? ' 수집 출처'
                                      : ''}{' '}
                                    원본 보기 (새 창)
                                  </span>
                                </a>
                              ) : (
                                <span
                                  title={label}
                                  className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                                >
                                  {vendor.vendor_name}
                                  {vendor.external_key !== undefined && (
                                    <span className="sr-only"> 수집 출처</span>
                                  )}
                                </span>
                              )}
                            </li>
                          );
                        })
                      ) : (
                        <li className="text-gray-400">등록된 출처 없음</li>
                      )}
                    </ul>
                  </InfoRow>
                  <InfoRow label="행사 기간">
                    {!article.starts_on && !article.ends_on
                      ? '기간 미정'
                      : `${formatDate(article.starts_on)} ~ ${formatDate(article.ends_on)}`}
                  </InfoRow>
                  <InfoRow label="상태">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${status?.color ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-current"
                      />
                      {status?.label ?? article.status}
                    </span>
                  </InfoRow>
                </dl>
              </section>
              <section
                aria-label="게시글 본문"
                className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <h2 className="border-b border-gray-100 bg-[#F8F9FA] px-5 py-4 text-xs text-gray-600">
                  게시글 본문
                </h2>
                {safeContent.trim() ? (
                  <div
                    className="admin-article-content p-6 text-sm leading-7 max-mobile:p-4"
                    dangerouslySetInnerHTML={{ __html: safeContent }}
                  />
                ) : (
                  <p className="p-6 text-sm text-gray-400">
                    등록된 본문이 없습니다.
                  </p>
                )}
              </section>
              {article.attachments.length > 0 && (
                <section
                  aria-label="첨부 파일"
                  className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <h2 className="border-b border-gray-100 bg-[#F8F9FA] px-5 py-4 text-xs text-gray-600">
                    첨부 파일 ({article.attachments.length})
                  </h2>
                  <ul className="divide-y divide-gray-100 px-5">
                    {article.attachments.map((attachment, index) => {
                      const url = getArticleWebUrl(attachment.file_url);
                      const name =
                        attachment.original_name || `첨부 파일 ${index + 1}`;
                      return (
                        <li
                          key={attachment.id ?? index}
                          className="flex min-w-0 items-center gap-2 py-4 text-sm"
                        >
                          <RiAttachment2
                            aria-hidden="true"
                            className="shrink-0 text-gray-400"
                          />
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-w-0 break-all underline underline-offset-4"
                            >
                              {name}
                              <span className="sr-only"> (새 창)</span>
                            </a>
                          ) : (
                            <span className="min-w-0 break-all text-gray-400">
                              {name} · 링크를 열 수 없습니다.
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          )
        )}
      </main>
      {validId && article && !detail.isError && (
        <footer className="border-t border-gray-100 bg-white">
          <div className="mx-auto flex max-w-[988px] justify-end px-6 py-4 max-mobile:px-4">
            <Link
              to={`/manage/edit/${article.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm text-white"
            >
              <RiPencilLine aria-hidden="true" />
              수정하기
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
};
export default MANDTRPage;
