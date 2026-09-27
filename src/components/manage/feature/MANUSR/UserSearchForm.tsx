import { useState } from 'react';
import type { FormEvent } from 'react';
import type { UserFilters } from '@/api/manage/users';

const EMPTY: UserFilters = { keyword: '', role: '', status: '' };
const UserSearchForm = ({
  onSearch,
}: {
  onSearch: (filters: UserFilters) => void;
}) => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = form.keyword.trim();
    if (keyword && keyword.length < 2) {
      setError('이름 또는 이메일을 2글자 이상 입력해 주세요.');
      return;
    }
    setError('');
    onSearch({ ...form, keyword });
  };
  return (
    <form
      aria-label="회원 검색"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 text-xs text-gray-500 shadow-sm"
    >
      <h2 className="mb-5 font-semibold text-gray-600">회원 검색</h2>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex min-w-0 flex-1 basis-80 items-center gap-3">
          <span className="shrink-0">이름 / 이메일</span>
          <input
            value={form.keyword}
            onChange={(event) =>
              setForm({ ...form, keyword: event.target.value })
            }
            placeholder="이메일 또는 이름을 입력하세요..."
            className="min-w-0 flex-1 rounded-lg border border-gray-100 bg-[#F7F8FA] px-4 py-2.5 text-gray-800 placeholder:text-gray-300"
          />
        </label>
        <fieldset aria-label="역할" className="flex items-center gap-2">
          <span>역할</span>
          <div className="flex overflow-hidden rounded-lg border border-gray-100">
            {(
              [
                ['', '전체'],
                ['USER', '사용자'],
                ['ADMIN', '관리자'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name="user-role"
                  value={value}
                  checked={form.role === value}
                  onChange={() => setForm({ ...form, role: value })}
                />
                <span className="block bg-[#F7F8FA] px-3 py-2.5 text-gray-700 peer-checked:bg-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-blue-500">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset aria-label="상태" className="flex items-center gap-2">
          <span>상태</span>
          <div className="flex overflow-hidden rounded-lg border border-gray-100">
            {(
              [
                ['', '전체'],
                ['ACTIVE', '활성'],
                ['WITHDRAWN', '탈퇴'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name="user-status"
                  value={value}
                  checked={form.status === value}
                  onChange={() => setForm({ ...form, status: value })}
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
              setError('');
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
      {error && (
        <p role="alert" className="mt-3 text-red-600">
          {error}
        </p>
      )}
    </form>
  );
};
export default UserSearchForm;
