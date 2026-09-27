import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import ReviewArticleTable from '@/components/manage/common/ReviewArticleTable';
import ArticleActionModal from '@/components/manage/common/ArticleActionModal';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import type { BulkResult } from '@/api/manage/dashboard';
import { getTrashArticles, runTrashAction } from '@/api/manage/trash';
import TrashSearchForm from '@/components/manage/feature/MANGBG/TrashSearchForm';
import {
  EMPTY_TRASH_FILTERS,
  filterTrashArticles,
} from '@/utils/manage/trashFilters';
import type { TrashFilters } from '@/utils/manage/trashFilters';

type Action = 'restore' | 'delete';
interface PendingAction {
  action: Action;
  ids: number[];
}
const STATUS = {
  PENDING_REVIEW: { label: '미검수', color: 'bg-gray-100 text-gray-600' },
  READY_TO_PUBLISH: {
    label: '반영대기',
    color: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  },
  PUBLISHED: {
    label: '운영',
    color: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  },
  DRAFT: { label: '임시저장', color: 'bg-blue-50 text-blue-600' },
};
const MANGBGPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_TRASH_FILTERS);
  const [selected, setSelected] = useState<number[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [result, setResult] = useState<{
    action: Action;
    data: BulkResult;
  } | null>(null);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const queryClient = useQueryClient();
  const articles = useQuery({
    queryKey: ['adminDashboard', 'trash'],
    queryFn: ({ signal }) => getTrashArticles(signal),
    retry: shouldRetryDashboardQuery,
  });
  const mutation = useMutation({
    mutationFn: ({ action, ids }: PendingAction) => runTrashAction(action, ids),
    onSuccess: async (data, request) => {
      setResult({ action: request.action, data });
      setSelected(data.failed.map((item) => item.id));
      setError('');
      // 필터는 유지하고 첫 페이지에서 갱신 결과를 확인합니다.
      if (!data.failed.length) setPage(1);
      const keys = [
        'adminDashboard',
        'adminArticles',
        'adminArticleCounts',
        'adminArticleDetail',
        'adminEditor',
      ];
      if (data.succeeded.length) {
        keys.push(
          'monthlyAll',
          'events',
          'eventDetail',
          'hotEvents',
          'bookmarks'
        );
        if (request.action === 'delete')
          keys.push('notifications', 'notificationsUnreadCount');
      }
      await Promise.all(
        keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
      );
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
    onSettled: () => {
      submitting.current = false;
    },
  });
  const allRows = articles.data ?? [];
  const filtered = filterTrashArticles(allRows, filters);
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 8))
  );
  const rows = filtered.slice((currentPage - 1) * 8, currentPage * 8);
  const list = articles.data
    ? {
        content: rows,
        page_info: {
          current_page: currentPage,
          size: 8,
          total_items: filtered.length,
          total_pages: Math.ceil(filtered.length / 8),
          has_next: currentPage * 8 < filtered.length,
        },
      }
    : undefined;
  const categories = [
    ...new Map(
      allRows.flatMap((row) => row.categories).map((item) => [item.id, item])
    ).values(),
  ];
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const canRestore =
    selectedRows.length > 0 &&
    selectedRows.every(
      (row) =>
        row.status === 'TRASHED' &&
        row.previous_status &&
        Object.hasOwn(STATUS, row.previous_status)
    );
  const canDelete =
    selectedRows.length > 0 &&
    selectedRows.every((row) => row.status === 'TRASHED');
  const handlePage = (next: number) => {
    setPage(next);
    setSelected([]);
  };
  const handleSearch = (next: TrashFilters) => {
    setFilters(next);
    handlePage(1);
  };
  const handleAction = (action: Action, ids: number[]) => {
    if (
      submitting.current ||
      articles.isFetching ||
      articles.isError ||
      !ids.length ||
      (action === 'restore' ? !canRestore : !canDelete)
    )
      return;
    setResult(null);
    setError('');
    setPendingAction({ action, ids });
  };
  const handleConfirm = () => {
    if (!pendingAction || submitting.current) return;
    submitting.current = true;
    mutation.mutate(pendingAction);
  };
  const forbidden = [articles.error, mutation.error].some(isDashboardForbidden);
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      <ManageNavigation />
      <main className="mx-auto max-w-[1600px] px-8 pb-20 pt-8 max-mobile:px-4 max-mobile:pt-6">
        {forbidden ? (
          <section
            role="alert"
            className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8"
          >
            <h1 className="text-xl font-bold">
              관리자 접근 권한을 확인해 주세요
            </h1>
            <p className="mt-4 text-sm">
              관리자 권한이 부여된 계정으로 다시 로그인해 주세요. (403
              FORBIDDEN)
            </p>
            <Link
              to="/login"
              state={{ from: { pathname: '/manage/garbage' } }}
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm text-white"
            >
              다시 로그인
            </Link>
          </section>
        ) : (
          <>
            <h1 className="text-[22px] font-bold text-black">휴지통</h1>
            <p className="mb-7 mt-1 text-sm text-gray-500">
              삭제된 게시글을 복구하거나 영구 삭제할 수 있습니다.
            </p>
            <TrashSearchForm
              disabled={
                articles.isPending ||
                articles.isFetching ||
                articles.isError ||
                mutation.isPending
              }
              categories={categories}
              onSearch={handleSearch}
            />
            {result && (
              <section
                role="status"
                className="my-6 rounded-xl border border-gray-200 bg-white p-4 text-sm"
              >
                <p>
                  {result.data.succeeded.length}건{' '}
                  {result.action === 'restore' ? '복구' : '영구 삭제'} 완료
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
                className="my-6 rounded-xl border border-red-100 bg-white p-4 text-sm text-red-600"
              >
                {error}
              </p>
            )}
            <h2 className="mb-3 mt-6 text-sm font-bold">휴지통 보관 게시물</h2>
            {selectedRows.length > 0 && !canRestore && (
              <p className="mb-3 text-sm text-amber-700">
                삭제 전 상태를 확인할 수 없는 게시글이 포함되어 복구할 수
                없습니다.
              </p>
            )}
            <ReviewArticleTable
              label="휴지통 보관 게시물"
              data={list}
              isPending={articles.isPending}
              isError={articles.isError}
              disabled={mutation.isPending || articles.isFetching}
              page={currentPage}
              selected={selected}
              onSelectionChange={setSelected}
              onPageChange={handlePage}
              primaryLabel="선택 복구"
              primaryDisabled={!canRestore}
              secondaryLabel="영구 삭제"
              secondaryDisabled={!canDelete}
              trashView
              onPrimaryAction={(ids) => handleAction('restore', ids)}
              onTrash={(ids) => handleAction('delete', ids)}
              onRetry={() => void articles.refetch()}
              renderStatus={(id) => {
                const previous = rows.find(
                  (row) => row.id === id
                )?.previous_status;
                const badge =
                  previous && Object.hasOwn(STATUS, previous)
                    ? STATUS[previous]
                    : undefined;
                return (
                  <span
                    title={
                      badge
                        ? '복구하면 이 상태로 돌아갑니다.'
                        : '삭제 직전 상태 이력이 없어 복구할 수 없습니다.'
                    }
                    className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] ${badge?.color ?? 'bg-gray-100 text-gray-500'}`}
                  >
                    {badge?.label ?? '이력 없음'}
                  </span>
                );
              }}
            />
            {pendingAction && (
              <ArticleActionModal
                action={pendingAction.action}
                count={pendingAction.ids.length}
                pending={mutation.isPending}
                onConfirm={handleConfirm}
                onCancel={() => setPendingAction(null)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
export default MANGBGPage;
