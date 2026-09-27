import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import UserSearchForm from '@/components/manage/feature/MANUSR/UserSearchForm';
import UserTable from '@/components/manage/feature/MANUSR/UserTable';
import UserDetailPanel from '@/components/manage/feature/MANUSR/UserDetailPanel';
import { getAdminUsers } from '@/api/manage/users';
import type { UserFilters } from '@/api/manage/users';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';

const MANUSRPage = () => {
  const [filters, setFilters] = useState<UserFilters>({
    keyword: '',
    role: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const users = useQuery({
    queryKey: ['adminUsers', 'list', filters, page],
    queryFn: ({ signal }) => getAdminUsers(filters, page, signal),
    retry: shouldRetryDashboardQuery,
  });
  useEffect(() => {
    if (users.isSuccess && !users.isFetching) {
      const lastPage = Math.max(1, users.data.page_info.total_pages);
      if (page > lastPage) setPage(lastPage);
    }
  }, [users.isSuccess, users.isFetching, users.data, page]);
  const handleSearch = (next: UserFilters) => {
    setFilters(next);
    setPage(1);
  };
  const forbidden = isDashboardForbidden(users.error);
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
              관리자 계정으로 다시 로그인해 주세요. (403 FORBIDDEN)
            </p>
            <Link
              to="/login"
              state={{ from: { pathname: '/manage/users' } }}
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm text-white"
            >
              다시 로그인
            </Link>
          </section>
        ) : (
          <>
            <h1 className="text-[22px] font-bold text-black">회원 관리</h1>
            <p className="mb-7 mt-1 text-sm text-gray-500">
              서비스 가입 회원의 권한 및 활동 상태를 관리합니다.
            </p>
            <UserSearchForm onSearch={handleSearch} />
            <UserTable
              data={users.data}
              page={page}
              pending={users.isPending}
              error={users.isError}
              fetching={users.isFetching}
              onPage={setPage}
              onOpen={setSelectedId}
              onRetry={() => void users.refetch()}
            />
          </>
        )}
      </main>
      {selectedId !== null && !forbidden && (
        <UserDetailPanel
          key={selectedId}
          userId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};
export default MANUSRPage;
