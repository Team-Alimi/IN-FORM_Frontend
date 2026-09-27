import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getDashboardOptions,
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import type { ReviewFilters } from '@/api/manage/review';

interface Props {
  title: string;
  label?: string;
  disabled: boolean;
  onSearch: (filters: ReviewFilters) => void;
}
const EMPTY = {
  article_id: '',
  keyword: '',
  vendor_id: '',
  category_id: '',
  starts_from: '',
  ends_to: '',
};
const INPUT =
  'rounded-lg border border-gray-100 bg-[#F7F8FA] px-3 py-2 text-xs text-gray-800 placeholder:text-gray-300';
const ArticleSearchForm = ({
  title,
  label = title,
  disabled,
  onSearch,
}: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const categories = useQuery({
    queryKey: ['adminDashboard', 'categories'],
    queryFn: () => getDashboardOptions('categories'),
    retry: shouldRetryDashboardQuery,
  });
  const vendors = useQuery({
    queryKey: ['adminDashboard', 'vendors'],
    queryFn: () => getDashboardOptions('vendors'),
    retry: shouldRetryDashboardQuery,
  });
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      form.article_id &&
      (!Number.isSafeInteger(Number(form.article_id)) ||
        Number(form.article_id) < 1)
    ) {
      setError('게시글 ID는 1 이상의 정수로 입력해 주세요.');
      return;
    }
    if (form.starts_from && form.ends_to && form.starts_from > form.ends_to) {
      setError('행사 기간의 종료일은 시작일 이후로 선택해 주세요.');
      return;
    }
    setError('');
    onSearch({
      article_id: form.article_id ? Number(form.article_id) : undefined,
      keyword: form.keyword.trim() || undefined,
      vendor_id: form.vendor_id ? Number(form.vendor_id) : undefined,
      category_id: form.category_id ? Number(form.category_id) : undefined,
      starts_from: form.starts_from || undefined,
      ends_to: form.ends_to || undefined,
    });
  };
  const handleReset = () => {
    setForm(EMPTY);
    setError('');
    onSearch({});
  };
  const optionForbidden =
    isDashboardForbidden(categories.error) ||
    isDashboardForbidden(vendors.error);
  return (
    <form
      aria-label={label}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 text-xs text-gray-500"
    >
      <h2 className="mb-5 font-semibold text-gray-600">{title}</h2>
      <fieldset
        disabled={disabled}
        className="flex flex-wrap items-center gap-x-5 gap-y-3 disabled:opacity-50"
      >
        <label className="flex items-center gap-3">
          게시글 ID
          <input
            type="number"
            min="1"
            max={Number.MAX_SAFE_INTEGER}
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
            disabled={!vendors.data}
            onChange={(event) =>
              setForm({ ...form, vendor_id: event.target.value })
            }
            className={`${INPUT} w-44`}
          >
            <option value="">
              {vendors.isPending ? '불러오는 중' : '전체 출처'}
            </option>
            {vendors.data?.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} (#{vendor.id})
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
        <label className="flex items-center gap-3">
          카테고리
          <select
            aria-label="카테고리"
            value={form.category_id}
            disabled={!categories.data}
            onChange={(event) =>
              setForm({ ...form, category_id: event.target.value })
            }
            className={`${INPUT} w-32`}
          >
            <option value="">
              {categories.isPending ? '불러오는 중' : '전체'}
            </option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-gray-200 px-4 py-2 text-gray-700"
          >
            초기화
          </button>
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-white"
          >
            조회
          </button>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="mt-3 text-red-600">
          {error}
        </p>
      )}
      {(categories.isError || vendors.isError) && (
        <p role="alert" className="mt-3 text-red-600">
          {optionForbidden
            ? '검색 옵션 조회 권한이 없습니다. 관리자 권한을 확인해 주세요.'
            : '검색 옵션을 불러오지 못했습니다.'}{' '}
          {!optionForbidden && (
            <button
              type="button"
              onClick={() => {
                void categories.refetch();
                void vendors.refetch();
              }}
              className="underline"
            >
              다시 시도
            </button>
          )}
        </p>
      )}
    </form>
  );
};
export default ArticleSearchForm;
