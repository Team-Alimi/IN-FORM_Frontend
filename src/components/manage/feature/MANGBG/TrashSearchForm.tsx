import { useState } from 'react';
import type { FormEvent } from 'react';
import type { NamedOption } from '@/api/manage/dashboard';
import { EMPTY_TRASH_FILTERS } from '@/utils/manage/trashFilters';
import type { TrashFilters } from '@/utils/manage/trashFilters';
const INPUT =
  'rounded-lg border border-gray-100 bg-[#F7F8FA] px-3 py-2 text-xs text-gray-800 placeholder:text-gray-300';
const TrashSearchForm = ({
  disabled,
  categories,
  onSearch,
}: {
  disabled: boolean;
  categories: NamedOption[];
  onSearch: (filters: TrashFilters) => void;
}) => {
  const [form, setForm] = useState(EMPTY_TRASH_FILTERS);
  const [error, setError] = useState('');
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      form.id &&
      (!Number.isSafeInteger(Number(form.id)) || Number(form.id) < 1)
    ) {
      setError('게시글 ID는 1 이상의 정수로 입력해 주세요.');
      return;
    }
    if (form.start && form.end && form.start > form.end) {
      setError('행사 기간의 종료일은 시작일 이후로 선택해 주세요.');
      return;
    }
    setError('');
    onSearch({ ...form, title: form.title.trim(), vendor: form.vendor.trim() });
  };
  return (
    <form
      aria-label="휴지통 게시글 검색"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 text-xs text-gray-500 shadow-sm"
    >
      <h2 className="mb-5 font-semibold text-gray-600">휴지통 게시글 검색</h2>
      <fieldset
        disabled={disabled}
        className="flex flex-wrap items-center gap-x-5 gap-y-3 disabled:opacity-50"
      >
        <label className="flex items-center gap-3">
          게시글 ID
          <input
            type="number"
            min="1"
            step="1"
            max={Number.MAX_SAFE_INTEGER}
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder="ID 검색"
            className={`${INPUT} w-32`}
          />
        </label>
        <label className="flex items-center gap-3">
          게시글 제목
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목 검색"
            className={`${INPUT} w-56 max-mobile:w-44`}
          />
        </label>
        <label className="flex items-center gap-3">
          출처
          <input
            value={form.vendor}
            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            placeholder="출처 검색"
            className={`${INPUT} w-36`}
          />
        </label>
        <div className="w-full max-mobile:hidden" />
        <div className="flex flex-wrap items-center gap-2">
          <span>행사 기간</span>
          <input
            aria-label="행사 기간 시작일"
            type="date"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            className={`${INPUT} w-32`}
          />
          <span>~</span>
          <input
            aria-label="행사 기간 종료일"
            type="date"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
            className={`${INPUT} w-32`}
          />
        </div>
        <label className="flex items-center gap-3">
          카테고리
          <select
            aria-label="카테고리"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={`${INPUT} w-32`}
          >
            <option value="">전체</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset
          className="flex flex-wrap items-center gap-2"
          aria-label="삭제 전 게시글 상태"
        >
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
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <input
                type="radio"
                name="trash-status"
                value={value}
                checked={form.status === value}
                onChange={() => setForm({ ...form, status: value ?? '' })}
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
              setForm(EMPTY_TRASH_FILTERS);
              setError('');
              onSearch(EMPTY_TRASH_FILTERS);
            }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700"
          >
            초기화
          </button>
          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-2 text-white"
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
    </form>
  );
};
export default TrashSearchForm;
