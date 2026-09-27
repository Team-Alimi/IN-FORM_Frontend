import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import type { UserList } from '@/api/manage/users';
import {
  UserRoleBadge,
  UserStatusBadge,
} from '@/components/manage/feature/MANUSR/UserBadges';
import { formatUserDate } from '@/utils/manage/userPresentation';

const UserTable = ({
  data,
  page,
  pending,
  error,
  fetching,
  onPage,
  onOpen,
  onRetry,
}: {
  data: UserList | undefined;
  page: number;
  pending: boolean;
  error: boolean;
  fetching: boolean;
  onPage: (page: number) => void;
  onOpen: (id: number) => void;
  onRetry: () => void;
}) => {
  const totalPages = data?.page_info.total_pages ?? 0;
  return (
    <section aria-label="회원 목록" aria-busy={fetching} className="mt-6">
      <h2 className="mb-3 text-sm font-bold">
        회원 목록{' '}
        <span className="text-gray-400">
          (
          {!error && data
            ? `${data.page_info.total_items.toLocaleString()}명`
            : '—'}
          )
        </span>
      </h2>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {pending ? (
          <p role="status" className="p-12 text-center text-sm text-gray-500">
            회원을 불러오는 중입니다.
          </p>
        ) : error ? (
          <p role="alert" className="p-12 text-center text-sm">
            회원 목록을 불러오지 못했습니다.{' '}
            <button onClick={onRetry} className="underline">
              다시 시도
            </button>
          </p>
        ) : !data?.content.length ? (
          <p className="p-12 text-center text-sm text-gray-500">
            조회된 회원이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] table-fixed text-left text-xs">
              <colgroup>
                <col className="w-[13%]" />
                <col className="w-[46%]" />
                <col className="w-[7%]" />
                <col className="w-[7%]" />
                <col className="w-[6%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
              </colgroup>
              <thead className="border-b border-gray-100 bg-[#F7F8FA] text-gray-600">
                <tr>
                  {[
                    '회원 고유 ID',
                    '이메일',
                    '이름',
                    '역할',
                    '상태',
                    '가입일시',
                    '관리',
                  ].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-4 py-4 font-medium whitespace-nowrap"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.content.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => {
                      if (!fetching) onOpen(user.id);
                    }}
                    className="h-[70px] cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 font-mono text-gray-500">{user.id}</td>
                    <td className="break-words px-4">{user.email}</td>
                    <td className="break-words px-4 font-semibold">
                      {user.name || '—'}
                    </td>
                    <td className="px-4">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-4">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 text-gray-400">
                      {formatUserDate(user.created_at)}
                    </td>
                    <td className="px-4">
                      <button
                        disabled={fetching}
                        aria-label={`${user.email} 상세보기`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpen(user.id);
                        }}
                        className="flex items-center gap-2 whitespace-nowrap py-3 disabled:opacity-40"
                      >
                        상세보기 <RiArrowRightSLine aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!error && totalPages > 0 && (
          <nav
            aria-label="회원 목록 페이지"
            className="flex justify-center gap-2 border-t border-gray-50 py-4 text-xs"
          >
            <button
              aria-label="이전 페이지"
              disabled={fetching || page <= 1}
              onClick={() => onPage(page - 1)}
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
                disabled={fetching}
                onClick={() => onPage(number)}
                className={`h-8 w-8 rounded-lg ${page === number ? 'bg-black text-white' : 'text-gray-600'}`}
              >
                {number}
              </button>
            ))}
            <button
              aria-label="다음 페이지"
              disabled={fetching || !data?.page_info.has_next}
              onClick={() => onPage(page + 1)}
              className="p-2 text-gray-400 disabled:opacity-30"
            >
              <RiArrowRightSLine size={18} />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};
export default UserTable;
