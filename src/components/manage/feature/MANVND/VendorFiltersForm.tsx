import { useState } from 'react';
import type { VendorFilters } from '@/api/manage/vendors';

const EMPTY: VendorFilters = { type: '', active: '' };
const VendorFiltersForm = ({
  onSearch,
}: {
  onSearch: (filters: VendorFilters) => void;
}) => {
  const [form, setForm] = useState(EMPTY);
  return (
    <form
      aria-label="제공처 검색 필터"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(form);
      }}
      className="rounded-2xl border border-gray-200 bg-white p-5 text-xs text-gray-500 shadow-sm"
    >
      <h2 className="mb-5 font-semibold text-gray-600">검색 필터</h2>
      <div className="flex flex-wrap items-center gap-5">
        <fieldset
          aria-label="유형"
          className="flex min-w-0 flex-wrap items-center gap-2"
        >
          <span>유형</span>
          <div className="flex flex-wrap overflow-hidden rounded-lg border border-gray-100">
            {(
              [
                ['', '전체 (All)'],
                ['SCHOOL', '교내 기관/학과 (SCHOOL)'],
                ['CLUB', '동아리 (CLUB)'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  className="peer sr-only"
                  name="vendor-type-filter"
                  value={value}
                  checked={form.type === value}
                  onChange={() => setForm({ ...form, type: value })}
                />
                <span className="block bg-[#F7F8FA] px-3 py-2.5 text-gray-700 peer-checked:bg-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-blue-500">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset aria-label="활성 여부" className="flex items-center gap-2">
          <span>활성 여부</span>
          <div className="flex overflow-hidden rounded-lg border border-gray-100">
            {(
              [
                ['', '전체'],
                ['true', '활성'],
                ['false', '숨김'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  className="peer sr-only"
                  name="vendor-active-filter"
                  value={value}
                  checked={form.active === value}
                  onChange={() => setForm({ ...form, active: value })}
                />
                <span className="block bg-[#F7F8FA] px-3 py-2.5 text-gray-700 peer-checked:bg-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-blue-500">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY);
              onSearch(EMPTY);
            }}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700"
          >
            초기화
          </button>
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2.5 text-white"
          >
            조회
          </button>
        </div>
      </div>
    </form>
  );
};
export default VendorFiltersForm;
