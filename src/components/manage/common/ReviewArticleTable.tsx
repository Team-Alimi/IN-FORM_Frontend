import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import type { DashboardList, ReviewStatus } from '@/api/manage/dashboard';
import CategoryBadge from '@/components/manage/common/CategoryBadge';

interface Props {
  label: string;
  data: DashboardList | undefined;
  isPending: boolean;
  isError: boolean;
  disabled: boolean;
  page: number;
  selected: number[];
  onSelectionChange: (ids: number[]) => void;
  onSelectAll: () => void;
  isSelectingAll?: boolean;
  selectionError?: string;
  onPageChange: (page: number) => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimaryAction: (ids: number[]) => void;
  onTrash: (ids: number[]) => void;
  onRetry: () => void;
  secondaryLabel?: string;
  secondaryDisabled?: boolean;
  trashView?: boolean;
  renderStatus?: (id: number) => ReactNode;
}
const STATUS_BADGES: Record<ReviewStatus, { label: string; color: string }> = {
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
  TRASHED: { label: '휴지통', color: 'bg-red-50 text-red-600' },
};
const formatDate = (value?: string) =>
  value ? value.slice(0, 10).replaceAll('-', '.') : '—';

const ReviewArticleTable = ({
  label,
  data,
  isPending,
  isError,
  disabled,
  page,
  selected,
  onSelectionChange,
  onSelectAll,
  isSelectingAll = false,
  selectionError,
  onPageChange,
  primaryLabel,
  primaryDisabled = false,
  onPrimaryAction,
  onTrash,
  onRetry,
  secondaryLabel = '삭제',
  secondaryDisabled = false,
  trashView = false,
  renderStatus,
}: Props) => {
  const location = useLocation();
  const rows = data?.content ?? [];
  const selectedIds = rows
    .filter((row) => selected.includes(row.id))
    .map((row) => row.id);
  const totalPages = data?.page_info.total_pages ?? 0;
  const totalItems = data?.page_info.total_items ?? 0;
  const allChecked = totalItems > 0 && selected.length === totalItems;
  const blocked = disabled || isPending || isError || isSelectingAll;
  const handleToggle = (id: number, checked: boolean) =>
    onSelectionChange(
      checked
        ? [...new Set([...selected, id])]
        : selected.filter((value) => value !== id)
    );
  return (
    <section
      aria-label={label}
      aria-busy={disabled}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
    >
      <div className="flex items-center justify-between gap-3 bg-[#F7F8FA] px-5 py-3 text-xs">
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            aria-label={`${label} 전체 선택`}
            className="h-4 w-4 accent-black"
            checked={allChecked}
            ref={(element) => {
              if (element)
                element.indeterminate = selected.length > 0 && !allChecked;
            }}
            disabled={blocked || rows.length === 0}
            onChange={onSelectAll}
          />
          {isSelectingAll
            ? '전체 선택 중…'
            : `전체 선택${selected.length > 0 ? ` (${selected.length})` : ''}`}
        </label>
        <div className="flex gap-2">
          <button
            disabled={blocked || primaryDisabled || !selected.length}
            onClick={() => onPrimaryAction(selected)}
            className={
              trashView
                ? 'rounded-lg border border-gray-200 px-4 py-2 text-gray-700 disabled:opacity-40'
                : 'rounded-full bg-black px-4 py-2 font-bold text-white disabled:opacity-40'
            }
          >
            {primaryLabel}
          </button>
          <button
            disabled={blocked || secondaryDisabled || !selected.length}
            onClick={() => onTrash(selected)}
            className={
              trashView
                ? 'rounded-lg border border-red-200 px-4 py-2 text-red-600 disabled:opacity-40'
                : 'rounded-full border border-gray-200 px-4 py-2 text-gray-600 disabled:opacity-40'
            }
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
      {selectionError && (
        <p role="alert" className="px-5 py-2 text-xs text-red-600">
          {selectionError}
        </p>
      )}
      {isPending ? (
        <p role="status" className="p-12 text-center text-sm text-gray-500">
          게시글을 불러오는 중입니다.
        </p>
      ) : isError ? (
        <p role="alert" className="p-12 text-center text-sm">
          게시글을 불러오지 못했습니다.{' '}
          <button onClick={onRetry} className="underline">
            다시 시도
          </button>
        </p>
      ) : rows.length === 0 ? (
        <p className="p-12 text-center text-sm text-gray-500">
          조회된 게시글이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] table-fixed text-left text-xs">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[7%]" />
              <col className="w-[7%]" />
              <col className="w-[7%]" />
              <col className="w-[43%]" />
              <col className="w-[15%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="border-y border-gray-100 bg-[#F7F8FA] text-gray-600">
              <tr>
                {[
                  '선택',
                  '게시글 ID',
                  '카테고리',
                  trashView ? '삭제 전 상태' : '상태',
                  '게시글 제목',
                  '행사 기간',
                  '출처',
                  '최종 수정일',
                ].map((heading) => (
                  <th
                    scope="col"
                    key={heading}
                    className="whitespace-nowrap px-4 py-5 font-medium"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-6">
                    <input
                      type="checkbox"
                      aria-label={`게시글 ${row.id} 선택`}
                      className="h-4 w-4 accent-black"
                      disabled={blocked}
                      checked={selectedIds.includes(row.id)}
                      onChange={(event) =>
                        handleToggle(row.id, event.target.checked)
                      }
                    />
                  </td>
                  <td className="px-4 font-semibold">{row.id}</td>
                  <td className="px-4">
                    <div className="flex flex-wrap gap-1">
                      {row.categories.length
                        ? row.categories.map((category) => (
                            <CategoryBadge
                              key={category.id}
                              name={category.name}
                            />
                          ))
                        : '—'}
                    </div>
                  </td>
                  <td className="px-4">
                    {renderStatus ? (
                      renderStatus(row.id)
                    ) : (
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] ${STATUS_BADGES[row.status]?.color ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_BADGES[row.status]?.label ?? row.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 font-medium">
                    <Link
                      to={`/manage/detail/${row.id}`}
                      state={{
                        returnTo: {
                          pathname: location.pathname,
                          search: location.search,
                          hash: location.hash,
                          state: location.state,
                        },
                      }}
                      className="break-words hover:underline"
                    >
                      {row.title}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 text-gray-400">
                    {formatDate(row.starts_on)} ~ {formatDate(row.ends_on)}
                  </td>
                  <td className="px-4 text-gray-500">
                    <span
                      className="line-clamp-2"
                      title={row.vendors
                        .map((vendor) => vendor.name)
                        .join(', ')}
                    >
                      {row.vendors.map((vendor) => vendor.name).join(', ') ||
                        '—'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 text-gray-400">
                    {formatDate(row.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 0 && !isError && (
        <nav
          aria-label={`${label} 페이지`}
          className="flex justify-center gap-2 border-t border-gray-50 py-4 text-xs"
        >
          <button
            aria-label="이전 페이지"
            disabled={blocked || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2 text-gray-400 disabled:opacity-30"
          >
            <RiArrowLeftSLine size={18} />
          </button>
          {Array.from(
            { length: Math.min(5, totalPages) },
            (_, index) =>
              Math.max(1, Math.min(page - 2, totalPages - 4)) + index
          ).map((number) => (
            <button
              key={number}
              aria-current={page === number ? 'page' : undefined}
              disabled={blocked}
              onClick={() => onPageChange(number)}
              className={`h-8 w-8 rounded-lg ${page === number ? 'bg-black text-white' : 'text-gray-600'}`}
            >
              {number}
            </button>
          ))}
          <button
            aria-label="다음 페이지"
            disabled={blocked || !data?.page_info.has_next}
            onClick={() => onPageChange(page + 1)}
            className="p-2 text-gray-400 disabled:opacity-30"
          >
            <RiArrowRightSLine size={18} />
          </button>
        </nav>
      )}
    </section>
  );
};
export default ReviewArticleTable;
