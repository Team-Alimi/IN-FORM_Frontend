import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import ArticleSearchForm from '@/components/manage/common/ArticleSearchForm';
import ReviewArticleTable from '@/components/manage/common/ReviewArticleTable';
import ArticleActionModal from '@/components/manage/common/ArticleActionModal';
import {
  getDashboardStats,
  isDashboardForbidden,
  runDashboardAction,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import { getStagedArticles } from '@/api/manage/review';
import type { BulkResult } from '@/api/manage/dashboard';
import type { ReviewFilters } from '@/api/manage/review';

type StagedAction = 'publish' | 'trash';
interface PendingAction {
  action: StagedAction;
  ids: number[];
}
const MANSTGPage = () => {
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [result, setResult] = useState<{
    action: StagedAction;
    data: BulkResult;
  } | null>(null);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const stats = useQuery({
    queryKey: ['adminDashboard', 'stats'],
    queryFn: getDashboardStats,
    retry: shouldRetryDashboardQuery,
  });
  const articles = useQuery({
    queryKey: ['adminDashboard', 'staged', filters, page],
    queryFn: () => getStagedArticles(filters, page),
    retry: shouldRetryDashboardQuery,
  });
  const mutation = useMutation({
    mutationFn: ({ action, ids }: PendingAction) =>
      runDashboardAction(action, ids),
    onSuccess: async (data, request) => {
      setResult({ action: request.action, data });
      setError('');
      setSelected(data.failed.map((item) => item.id));
      const source = articles.data;
      const lastPage = source
        ? Math.max(
            1,
            Math.ceil(
              (source.page_info.total_items - data.succeeded.length) /
                source.page_info.size
            )
          )
        : 1;
      setPage((current) =>
        data.failed.length ? Math.min(current, lastPage) : 1
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['adminArticles'] }),
        queryClient.invalidateQueries({ queryKey: ['adminArticleCounts'] }),
        ...(data.succeeded.length
          ? [
              'monthlyAll',
              'events',
              'eventDetail',
              'hotEvents',
              'bookmarks',
              'notifications',
              'notificationsUnreadCount',
            ].map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
          : []),
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
  const selectedRows =
    articles.data?.content.filter((row) => selected.includes(row.id)) ?? [];
  const canPublish =
    selectedRows.length > 0 &&
    selectedRows.every((row) => row.status === 'READY_TO_PUBLISH');
  const handlePage = (next: number) => {
    setPage(next);
    setSelected([]);
  };
  const handleSearch = (next: ReviewFilters) => {
    setFilters(next);
    handlePage(1);
  };
  const handleAction = (action: StagedAction, ids: number[]) => {
    if (
      mutation.isPending ||
      articles.isFetching ||
      !ids.length ||
      (action === 'publish' && !canPublish)
    )
      return;
    setResult(null);
    setError('');
    setPendingAction({ action, ids });
  };
  const handleConfirm = () => {
    if (pendingAction && !mutation.isPending) mutation.mutate(pendingAction);
  };
  const forbidden = [stats.error, articles.error, mutation.error].some(
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
            {/* MANLGN은 아직 임시 화면이므로 실제 OAuth 로그인 경로를 사용합니다. */}
            <Link
              to="/login"
              state={{ from: { pathname: '/manage/staged' } }}
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm text-white"
            >
              다시 로그인
            </Link>
          </section>
        </main>
      ) : (
        <main className="mx-auto max-w-[1600px] px-8 pb-20 pt-8 max-mobile:px-4 max-mobile:pt-6">
          <h1 className="text-[22px] font-bold text-black">
            반영 대기 게시글{' '}
            <span className="text-base text-gray-400">
              ({stats.data?.ready_to_publish.toLocaleString() ?? '—'})
            </span>
          </h1>
          <p className="mb-7 mt-1 text-sm text-gray-500">
            운영 반영을 대기 중인 게시글 목록입니다.
          </p>
          {stats.isError && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              전체 반영 대기 건수를 불러오지 못했습니다.{' '}
              <button
                onClick={() => void stats.refetch()}
                className="underline"
              >
                다시 시도
              </button>
            </p>
          )}
          <ArticleSearchForm
            title="검색"
            label="반영 대기 게시글 검색"
            disabled={mutation.isPending}
            onSearch={handleSearch}
          />
          {result && (
            <section
              role="status"
              className="mt-6 rounded-xl border border-gray-200 bg-white p-4 text-sm"
            >
              <p>
                {result.data.succeeded.length}건{' '}
                {result.action === 'publish' ? '운영 반영' : '휴지통으로 이동'}{' '}
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
              className="mt-6 rounded-xl border border-red-100 bg-white p-4 text-sm text-red-600"
            >
              {error}
            </p>
          )}
          {selectedRows.length > 0 && !canPublish && (
            <p className="mt-4 text-sm text-amber-700">
              운영 반영은 반영대기 상태의 게시글만 선택했을 때 가능합니다.
              목록을 새로 확인해 주세요.
            </p>
          )}
          <div className="mt-6">
            <ReviewArticleTable
              label="반영 대기 게시글"
              data={articles.data}
              isPending={articles.isPending}
              isError={articles.isError}
              disabled={mutation.isPending || articles.isFetching}
              page={page}
              selected={selected}
              onSelectionChange={setSelected}
              onPageChange={handlePage}
              primaryLabel="운영 반영"
              primaryDisabled={!canPublish}
              onPrimaryAction={(ids) => handleAction('publish', ids)}
              onTrash={(ids) => handleAction('trash', ids)}
              onRetry={() => void articles.refetch()}
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
export default MANSTGPage;
