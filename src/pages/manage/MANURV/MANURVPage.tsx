import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import ReviewArticleTable from '@/components/manage/common/ReviewArticleTable';
import ArticleSearchForm from '@/components/manage/common/ArticleSearchForm';
import ArticleActionModal from '@/components/manage/common/ArticleActionModal';
import {
  getDashboardStats,
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import { getUnreviewedArticles, runReviewAction } from '@/api/manage/review';
import type { BulkResult } from '@/api/manage/dashboard';
import type { ReviewAction, ReviewFilters } from '@/api/manage/review';

type Section = 'checks' | 'all';
interface PendingAction {
  section: Section;
  action: ReviewAction;
  ids: number[];
}
const MANURVPage = () => {
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [pages, setPages] = useState({ checks: 1, all: 1 });
  const [selected, setSelected] = useState<Record<Section, number[]>>({
    checks: [],
    all: [],
  });
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [result, setResult] = useState<{
    action: ReviewAction;
    data: BulkResult;
  } | null>(null);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const stats = useQuery({
    queryKey: ['adminDashboard', 'stats'],
    queryFn: getDashboardStats,
    retry: shouldRetryDashboardQuery,
  });
  const checks = useQuery({
    queryKey: ['adminDashboard', 'unreviewed', 'checks', pages.checks],
    queryFn: () => getUnreviewedArticles({}, pages.checks, true),
    retry: shouldRetryDashboardQuery,
  });
  const all = useQuery({
    queryKey: ['adminDashboard', 'unreviewed', 'all', filters, pages.all],
    queryFn: () => getUnreviewedArticles(filters, pages.all),
    retry: shouldRetryDashboardQuery,
  });
  const mutation = useMutation({
    mutationFn: (request: PendingAction) =>
      runReviewAction(request.action, request.ids),
    onSuccess: async (data, request) => {
      setResult({ action: request.action, data });
      setError('');
      const source = request.section === 'checks' ? checks.data : all.data;
      const lastPage = source
        ? Math.max(
            1,
            Math.ceil(
              (source.page_info.total_items - data.succeeded.length) /
                source.page_info.size
            )
          )
        : 1;
      // 처리한 쪽의 실패 선택만 남기고, 다른 목록에 남은 동일 공지 선택을 해제합니다.
      setSelected({
        checks:
          request.section === 'checks'
            ? data.failed.map((item) => item.id)
            : [],
        all:
          request.section === 'all' ? data.failed.map((item) => item.id) : [],
      });
      setPages((current) => ({
        checks:
          request.section === 'checks' && data.failed.length
            ? Math.min(current.checks, lastPage)
            : 1,
        all:
          request.section === 'all' && data.failed.length
            ? Math.min(current.all, lastPage)
            : 1,
      }));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['adminArticles'] }),
        queryClient.invalidateQueries({ queryKey: ['adminArticleCounts'] }),
      ]);
      setPendingAction(null);
    },
    onError: (cause) => {
      setPendingAction(null);
      setError(
        isAxiosError(cause) &&
          typeof cause.response?.data?.error?.message === 'string'
          ? cause.response.data.error.message
          : '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    },
  });
  const handlePage = (section: Section, page: number) => {
    setPages((current) => ({ ...current, [section]: page }));
    setSelected((current) => ({ ...current, [section]: [] }));
  };
  const handleSearch = (next: ReviewFilters) => {
    setFilters(next);
    handlePage('all', 1);
  };
  const handleAction = (
    section: Section,
    action: ReviewAction,
    ids: number[]
  ) => {
    if (mutation.isPending || !ids.length) return;
    setResult(null);
    setError('');
    setPendingAction({ section, action, ids });
  };
  const handleConfirm = () => {
    if (pendingAction && !mutation.isPending) mutation.mutate(pendingAction);
  };
  const forbidden = [stats.error, checks.error, all.error, mutation.error].some(
    isDashboardForbidden
  );
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      <ManageNavigation />
      {forbidden ? (
        <main className="mx-auto max-w-xl px-6 py-16">
          <section
            role="alert"
            className="rounded-2xl border border-gray-200 bg-white p-8"
          >
            <h1 className="text-xl font-bold">
              관리자 접근 권한을 확인해 주세요
            </h1>
            <p className="mt-4 text-sm">
              서버가 관리자 API 요청을 거부했습니다. (403 FORBIDDEN)
            </p>
            <p className="mt-3 text-sm text-gray-600">
              관리자 권한이 부여된 계정으로 다시 로그인해 주세요. 같은 문제가
              계속되면 서버 관리자에게 계정 권한을 확인해 달라고 요청해 주세요.
            </p>
            <Link
              to="/login"
              state={{ from: { pathname: '/manage/unreviewed' } }}
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm text-white"
            >
              다시 로그인
            </Link>
          </section>
        </main>
      ) : (
        <main className="mx-auto max-w-[1600px] px-8 pb-20 pt-8 max-mobile:px-4 max-mobile:pt-6">
          <h1 className="mb-4 text-[22px] font-bold text-black">
            미검수 게시글{' '}
            <span className="text-base text-gray-400">
              ({stats.data?.pending_review.toLocaleString() ?? '—'})
            </span>
          </h1>
          {stats.isError && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              전체 미검수 건수를 불러오지 못했습니다.{' '}
              <button
                onClick={() => void stats.refetch()}
                className="underline"
              >
                다시 시도
              </button>
            </p>
          )}
          {result && (
            <section
              role="status"
              className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-sm"
            >
              <p>
                {result.data.succeeded.length}건{' '}
                {result.action === 'ready'
                  ? '반영대기로 이동'
                  : '휴지통으로 이동'}{' '}
                완료
                {result.data.failed.length > 0 &&
                  ` · ${result.data.failed.length}건 실패`}
              </p>
              {result.data.failed.length > 0 && (
                <ul className="mt-2 space-y-1 text-red-600">
                  {result.data.failed.map((item) => (
                    <li key={item.id}>
                      #{item.id}: {item.message}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-red-100 bg-white p-4 text-sm text-red-600"
            >
              {error}
            </p>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h2 className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              확인 필요 게시글
            </h2>
            <p className="text-xs text-gray-400">
              중복이 의심되거나, 기간·본문·카테고리·원본 링크 정보가 부족한
              게시글입니다.
            </p>
          </div>
          <ReviewArticleTable
            label="확인 필요 게시글"
            data={checks.data}
            isPending={checks.isPending}
            isError={checks.isError}
            disabled={mutation.isPending || checks.isFetching}
            page={pages.checks}
            selected={selected.checks}
            onSelectionChange={(ids) =>
              setSelected((current) => ({ ...current, checks: ids }))
            }
            onPageChange={(page) => handlePage('checks', page)}
            primaryLabel="반영대기"
            onPrimaryAction={(ids) => handleAction('checks', 'ready', ids)}
            onTrash={(ids) => handleAction('checks', 'trash', ids)}
            onRetry={() => void checks.refetch()}
          />
          <div className="my-7 flex items-center gap-5 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            <span>전체 미검수 게시글 검색</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <ArticleSearchForm
            title="미검수 게시글 검색"
            disabled={mutation.isPending}
            onSearch={handleSearch}
          />
          <div className="mt-6">
            <ReviewArticleTable
              label="전체 미검수 게시글"
              data={all.data}
              isPending={all.isPending}
              isError={all.isError}
              disabled={mutation.isPending || all.isFetching}
              page={pages.all}
              selected={selected.all}
              onSelectionChange={(ids) =>
                setSelected((current) => ({ ...current, all: ids }))
              }
              onPageChange={(page) => handlePage('all', page)}
              primaryLabel="반영대기"
              onPrimaryAction={(ids) => handleAction('all', 'ready', ids)}
              onTrash={(ids) => handleAction('all', 'trash', ids)}
              onRetry={() => void all.refetch()}
            />
          </div>
          {pendingAction && (
            <ArticleActionModal
              action={pendingAction.action}
              count={pendingAction.ids.length}
              pending={mutation.isPending}
              onConfirm={handleConfirm}
              onCancel={() => setPendingAction(null)}
            />
          )}
        </main>
      )}
    </div>
  );
};
export default MANURVPage;
