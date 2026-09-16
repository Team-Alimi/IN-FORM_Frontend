import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RiArrowRightLine, RiAddLine } from 'react-icons/ri';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import {
  getDashboardArticles,
  getDashboardOptions,
  getDashboardStats,
  runDashboardAction,
} from '@/api/manage/dashboard';
import type { ArticleFilters, ReviewStatus } from '@/api/manage/dashboard';
import useAuthStore from '@/stores/useAuthStore';

const LABELS: Record<ReviewStatus, string> = {
  PENDING_REVIEW: '미검수',
  READY_TO_PUBLISH: '반영대기',
  PUBLISHED: '운영',
  DRAFT: '임시저장',
  TRASHED: '휴지통',
};
const COLORS: Record<ReviewStatus, string> = {
  PENDING_REVIEW: 'bg-gray-100 text-gray-600',
  READY_TO_PUBLISH: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  DRAFT: 'bg-blue-50 text-blue-600',
  TRASHED: 'bg-red-50 text-red-600',
};
const INPUT =
  'rounded-lg border border-gray-100 bg-[#F7F8FA] px-3 py-2 text-xs text-gray-800 placeholder:text-gray-300';
const EMPTY = {
  article_id: '',
  keyword: '',
  vendor_id: '',
  category_id: '',
  starts_from: '',
  ends_to: '',
  status: '',
};
const formatDate = (value?: string) =>
  value ? value.slice(0, 10).replaceAll('-', '.') : '—';

const MANHOMPage = () => {
  const [form, setForm] = useState(EMPTY);
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const userInfo = useAuthStore((state) => state.userInfo);
  const queryClient = useQueryClient();
  const stats = useQuery({
    queryKey: ['adminDashboard', 'stats'],
    queryFn: getDashboardStats,
  });
  const checks = useQuery({
    queryKey: ['adminDashboard', 'needsCheck'],
    queryFn: () => getDashboardArticles({ needs_check: true }, 1, 1),
  });
  const articles = useQuery({
    queryKey: ['adminDashboard', 'articles', filters, page],
    queryFn: () => getDashboardArticles(filters, page),
  });
  const categories = useQuery({
    queryKey: ['adminDashboard', 'categories'],
    queryFn: () => getDashboardOptions('categories'),
  });
  const vendors = useQuery({
    queryKey: ['adminDashboard', 'vendors'],
    queryFn: () => getDashboardOptions('vendors'),
  });
  const mutation = useMutation({
    mutationFn: ({
      action,
      ids,
    }: {
      action: 'publish' | 'trash';
      ids: number[];
    }) => runDashboardAction(action, ids),
    onSuccess: (result) => {
      setSelected(result.failed.map((item) => item.id));
      setNotice(
        `${result.succeeded.length}건 처리 완료${result.failed.length ? `. ${result.failed.map((item) => `#${item.id}: ${item.message}`).join(' / ')}` : ''}`
      );
      if (result.failed.length === 0) setPage(1);
      void queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      void queryClient.invalidateQueries({ queryKey: ['adminArticleCounts'] });
    },
    onError: () =>
      setNotice(
        '처리하지 못했습니다. 목록을 새로 확인한 후 다시 시도해 주세요.'
      ),
  });
  const rows = articles.data?.content ?? [];
  const chosen = rows.filter((row) => selected.includes(row.id));
  const canPublish =
    chosen.length > 0 &&
    chosen.every(
      (row) => row.status === 'READY_TO_PUBLISH' || row.status === 'DRAFT'
    );
  const busy = mutation.isPending || articles.isFetching || articles.isError;
  const totalPages = articles.data?.page_info.total_pages ?? 0;
  const handleFilter = (next: ArticleFilters) => {
    setFilters(next);
    setPage(1);
    setSelected([]);
    setNotice('');
  };
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.starts_from && form.ends_to && form.starts_from > form.ends_to) {
      setNotice('행사 기간의 종료일은 시작일 이후로 선택해 주세요.');
      return;
    }
    handleFilter({
      article_id: form.article_id ? Number(form.article_id) : undefined,
      keyword: form.keyword.trim() || undefined,
      vendor_id: form.vendor_id ? Number(form.vendor_id) : undefined,
      category_id: form.category_id ? Number(form.category_id) : undefined,
      starts_from: form.starts_from || undefined,
      ends_to: form.ends_to || undefined,
      status: (form.status || undefined) as ReviewStatus | undefined,
    });
  };
  const handleAction = (action: 'publish' | 'trash') => {
    if (busy || !chosen.length || (action === 'publish' && !canPublish)) return;
    if (
      !window.confirm(
        action === 'publish'
          ? `선택한 ${chosen.length}건을 운영에 반영하시겠습니까?`
          : `선택한 ${chosen.length}건을 휴지통으로 이동하시겠습니까?`
      )
    )
      return;
    mutation.mutate({ action, ids: chosen.map((row) => row.id) });
  };
  const handleCard = (next: ArticleFilters) => {
    setForm({ ...EMPTY, status: next.status ?? '' });
    handleFilter(next);
  };
  const handlePage = (next: number) => {
    setPage(next);
    setSelected([]);
  };
  const cards = [
    {
      label: '미검수 게시글',
      value: stats.data?.pending_review,
      error: stats.isError,
      filter: { status: 'PENDING_REVIEW' } as ArticleFilters,
    },
    {
      label: '반영 대기 게시글',
      value: stats.data?.ready_to_publish,
      error: stats.isError,
      filter: { status: 'READY_TO_PUBLISH' } as ArticleFilters,
    },
    {
      label: '확인 필요 게시글',
      value: checks.data?.page_info.total_items,
      error: checks.isError,
      filter: { needs_check: true },
    },
  ];
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      <ManageNavigation />
      <main className="mx-auto max-w-[1600px] px-8 pb-20 pt-8 max-mobile:px-4 max-mobile:pt-6">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-black">
              안녕하세요. {userInfo?.name ?? '관리자'} 님,
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              현재 크롤링된 게시글 상태를 확인하세요.
            </p>
          </div>
          <Link
            to="/manage/edit"
            className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-xs font-bold text-white"
          >
            <RiAddLine size={18} />
            게시글 추가
          </Link>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-4 max-mobile:grid-cols-1">
          {cards.map((card) => (
            <button
              key={card.label}
              disabled={mutation.isPending}
              onClick={() => handleCard(card.filter)}
              className="rounded-2xl border border-gray-200 bg-white px-6 py-6 text-left hover:border-gray-400 disabled:opacity-50"
            >
              <span className="text-xs text-gray-500">{card.label}</span>
              <span className="mt-3 flex items-center justify-between">
                <span>
                  <strong className="text-[40px] leading-none text-black">
                    {card.error ? '—' : (card.value?.toLocaleString() ?? '…')}
                  </strong>
                  <span className="ml-1 text-gray-400">개</span>
                </span>
                <RiArrowRightLine className="h-9 w-9 rounded-full border border-gray-100 p-2 text-gray-400" />
              </span>
            </button>
          ))}
        </div>
        {(stats.isError || checks.isError) && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            통계를 불러오지 못했습니다.{' '}
            <button
              className="underline"
              onClick={() => {
                void stats.refetch();
                void checks.refetch();
              }}
            >
              다시 시도
            </button>
          </p>
        )}
        <form
          onSubmit={handleSearch}
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-xs text-gray-500"
        >
          <h2 className="mb-5 font-bold">통합 검색</h2>
          <fieldset
            disabled={mutation.isPending}
            className="flex flex-wrap items-center gap-x-5 gap-y-3 disabled:opacity-50"
          >
            <label className="flex items-center gap-3">
              게시글 ID
              <input
                type="number"
                min="1"
                step="1"
                value={form.article_id}
                onChange={(event) =>
                  setForm({ ...form, article_id: event.target.value })
                }
                placeholder="ID 검색"
                className={`${INPUT} w-32`}
              />
            </label>
            <label className="flex items-center gap-3">
              게시글 제목
              <input
                value={form.keyword}
                onChange={(event) =>
                  setForm({ ...form, keyword: event.target.value })
                }
                placeholder="제목 검색"
                className={`${INPUT} w-56 max-mobile:w-44`}
              />
            </label>
            <label className="flex items-center gap-3">
              출처
              <select
                aria-label="출처"
                value={form.vendor_id}
                onChange={(event) =>
                  setForm({ ...form, vendor_id: event.target.value })
                }
                className={`${INPUT} w-44`}
                disabled={!vendors.data}
              >
                <option value="">
                  {vendors.isPending ? '불러오는 중' : '전체 출처'}
                </option>
                {vendors.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (#{item.id})
                  </option>
                ))}
              </select>
            </label>
            <div className="w-full max-mobile:hidden" />
            <div className="flex flex-wrap items-center gap-2">
              <span>행사 기간</span>
              <input
                aria-label="행사 기간 시작일"
                type="date"
                value={form.starts_from}
                onChange={(event) =>
                  setForm({ ...form, starts_from: event.target.value })
                }
                className={`${INPUT} w-36`}
              />
              <span>~</span>
              <input
                aria-label="행사 기간 종료일"
                type="date"
                value={form.ends_to}
                onChange={(event) =>
                  setForm({ ...form, ends_to: event.target.value })
                }
                className={`${INPUT} w-36`}
              />
            </div>
            <label className="flex items-center gap-2">
              카테고리
              <select
                aria-label="카테고리"
                value={form.category_id}
                onChange={(event) =>
                  setForm({ ...form, category_id: event.target.value })
                }
                className={`${INPUT} w-32`}
                disabled={!categories.data}
              >
                <option value="">
                  {categories.isPending ? '불러오는 중' : '전체'}
                </option>
                {categories.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="flex flex-wrap items-center gap-3">
              <legend className="sr-only">게시글 상태</legend>
              <span>게시글 상태</span>
              {[
                ['', '전체'],
                ['PENDING_REVIEW', '미검수'],
                ['READY_TO_PUBLISH', '반영대기'],
                ['PUBLISHED', '운영'],
                ['DRAFT', '임시저장'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-1 text-gray-700"
                >
                  <input
                    type="radio"
                    name="status"
                    value={value}
                    checked={form.status === value}
                    onChange={() => setForm({ ...form, status: value! })}
                    className="accent-black"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm(EMPTY);
                  handleFilter({});
                }}
                className="rounded-full border border-gray-200 px-4 py-2"
              >
                초기화
              </button>
              <button
                type="submit"
                className="rounded-full bg-black px-4 py-2 text-white"
              >
                조회
              </button>
            </div>
          </fieldset>
          {(categories.isError || vendors.isError) && (
            <p role="alert" className="mt-3 text-red-600">
              검색 옵션을 불러오지 못했습니다.{' '}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  void categories.refetch();
                  void vendors.refetch();
                }}
              >
                다시 시도
              </button>
            </p>
          )}
        </form>
        <h2 className="mb-3 text-sm font-bold text-black">
          {filters.needs_check ? '확인 필요 게시글' : '조회 결과 게시물'}
        </h2>
        {notice && (
          <p
            role="status"
            className="mb-3 whitespace-pre-wrap rounded-lg border border-gray-200 bg-white p-3 text-sm"
          >
            {notice}
          </p>
        )}
        <section
          aria-label="조회 결과"
          aria-busy={articles.isFetching}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <div className="flex items-center justify-between gap-2 bg-[#F7F8FA] px-5 py-3 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                aria-label="현재 페이지 전체 선택"
                checked={rows.length > 0 && chosen.length === rows.length}
                ref={(element) => {
                  if (element)
                    element.indeterminate =
                      chosen.length > 0 && chosen.length < rows.length;
                }}
                disabled={busy || !rows.length}
                onChange={(event) =>
                  setSelected(
                    event.target.checked ? rows.map((row) => row.id) : []
                  )
                }
                className="accent-black"
              />
              전체 선택{chosen.length > 0 && ` (${chosen.length})`}
            </label>
            <div className="flex gap-2">
              <button
                disabled={busy || !canPublish}
                title="반영대기 또는 임시저장 게시글만 운영에 반영할 수 있습니다."
                onClick={() => handleAction('publish')}
                className="rounded-full bg-black px-4 py-2 text-white disabled:opacity-40"
              >
                운영 반영
              </button>
              <button
                disabled={busy || !chosen.length}
                onClick={() => handleAction('trash')}
                className="rounded-full border border-gray-200 px-4 py-2 disabled:opacity-40"
              >
                삭제
              </button>
            </div>
          </div>
          {chosen.length > 0 && !canPublish && (
            <p className="px-5 py-2 text-xs text-amber-700">
              운영 반영은 반영대기·임시저장 게시글만 선택했을 때 가능합니다.
            </p>
          )}
          {articles.isPending ? (
            <p role="status" className="p-12 text-center text-sm">
              게시글을 불러오는 중입니다.
            </p>
          ) : articles.isError ? (
            <p role="alert" className="p-12 text-center text-sm">
              게시글을 불러오지 못했습니다.{' '}
              <button
                onClick={() => void articles.refetch()}
                className="underline"
              >
                다시 시도
              </button>
            </p>
          ) : !rows.length ? (
            <p className="p-12 text-center text-sm text-gray-500">
              조회된 게시글이 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-xs">
                <thead className="border-b border-gray-200 bg-[#F7F8FA] text-gray-600">
                  <tr>
                    {[
                      '선택',
                      '게시글 ID',
                      '카테고리',
                      '상태',
                      '게시글 제목',
                      '행사 기간',
                      '출처',
                      '최종 수정일',
                    ].map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className="px-4 py-5 font-medium"
                      >
                        {label}
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
                          disabled={busy}
                          checked={selected.includes(row.id)}
                          onChange={(event) =>
                            setSelected(
                              event.target.checked
                                ? [...selected, row.id]
                                : selected.filter((id) => id !== row.id)
                            )
                          }
                          className="accent-black"
                        />
                      </td>
                      <td className="px-4 font-semibold">{row.id}</td>
                      <td className="px-4">
                        <div className="flex flex-wrap gap-1">
                          {row.categories.length
                            ? row.categories.map((category) => (
                                <span
                                  key={category.id}
                                  className="whitespace-nowrap rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-600"
                                >
                                  {category.name}
                                </span>
                              ))
                            : '—'}
                        </div>
                      </td>
                      <td className="px-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] ${COLORS[row.status]}`}
                        >
                          {LABELS[row.status] ?? row.status}
                        </span>
                      </td>
                      <td className="min-w-64 px-4 font-medium">
                        <Link
                          to={`/manage/detail/${row.id}`}
                          className="hover:underline"
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 text-gray-400">
                        {formatDate(row.starts_on)} ~ {formatDate(row.ends_on)}
                      </td>
                      <td className="max-w-44 px-4 text-gray-500">
                        {row.vendors.map((vendor) => vendor.name).join(', ') ||
                          '—'}
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
          {totalPages > 0 && !articles.isError && (
            <nav
              aria-label="게시글 페이지"
              className="flex items-center justify-center gap-2 border-t border-gray-50 py-4 text-xs"
            >
              <button
                aria-label="이전 페이지"
                disabled={page <= 1 || busy}
                onClick={() => handlePage(page - 1)}
                className="p-2 disabled:opacity-30"
              >
                〈
              </button>
              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, index) =>
                  Math.max(1, Math.min(page - 2, totalPages - 4)) + index
              ).map((number) => (
                <button
                  key={number}
                  disabled={busy}
                  aria-current={page === number ? 'page' : undefined}
                  onClick={() => handlePage(number)}
                  className={`h-8 w-8 rounded-full ${page === number ? 'bg-black text-white' : ''}`}
                >
                  {number}
                </button>
              ))}
              <button
                aria-label="다음 페이지"
                disabled={!articles.data?.page_info.has_next || busy}
                onClick={() => handlePage(page + 1)}
                className="p-2 disabled:opacity-30"
              >
                〉
              </button>
            </nav>
          )}
        </section>
      </main>
    </div>
  );
};
export default MANHOMPage;
