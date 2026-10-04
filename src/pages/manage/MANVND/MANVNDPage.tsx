import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RiAddLine } from 'react-icons/ri';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import VendorFiltersForm from '@/components/manage/feature/MANVND/VendorFiltersForm';
import VendorTable from '@/components/manage/feature/MANVND/VendorTable';
import VendorEditorModal from '@/components/manage/feature/MANVND/VendorEditorModal';
import { getAdminVendors } from '@/api/manage/vendors';
import type { AdminVendor, VendorFilters } from '@/api/manage/vendors';
import { getVendorWarning } from '@/utils/manage/vendorForm';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';

const MANVNDPage = () => {
  const [filters, setFilters] = useState<VendorFilters>({
    type: '',
    active: '',
  });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ vendor: AdminVendor | null } | null>(
    null
  );
  const [lastSaved, setLastSaved] = useState<AdminVendor | null>(null);
  const vendors = useQuery({
    queryKey: ['adminVendors', filters],
    queryFn: ({ signal }) => getAdminVendors(filters, signal),
    retry: shouldRetryDashboardQuery,
  });
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil((vendors.data?.length ?? 0) / 8))
  );
  const handleSearch = (next: VendorFilters) => {
    setFilters(next);
    setPage(1);
  };
  const handleSaved = (vendor: AdminVendor) => {
    setLastSaved(vendor);
    if (!editing?.vendor) setPage(1);
  };
  const forbidden = isDashboardForbidden(vendors.error);
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
              state={{ from: { pathname: '/manage/vendors' } }}
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm text-white"
            >
              다시 로그인
            </Link>
          </section>
        ) : (
          <>
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-bold text-black">
                  제공처 및 동아리 관리
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  교내 부서, 학과 및 동아리 크롤링 출처를 관리합니다.
                </p>
              </div>
              <button
                onClick={() => setEditing({ vendor: null })}
                className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-xs font-semibold text-white"
              >
                <RiAddLine size={18} />
                제공처/동아리 추가
              </button>
            </div>
            <VendorFiltersForm onSearch={handleSearch} />
            {lastSaved && !editing && (
              <section
                role="status"
                className="mt-5 rounded-xl border border-gray-200 bg-white p-4 text-sm"
              >
                <p>
                  #{lastSaved.id} {lastSaved.name} 저장 완료
                </p>
                {getVendorWarning(lastSaved) && (
                  <p className="mt-2 break-words text-amber-700">
                    {getVendorWarning(lastSaved)}
                  </p>
                )}
              </section>
            )}
            <VendorTable
              data={vendors.data}
              page={currentPage}
              pending={vendors.isPending}
              error={vendors.isError}
              fetching={vendors.isFetching}
              onPage={setPage}
              onEdit={(vendor) => setEditing({ vendor })}
              onRetry={() => void vendors.refetch()}
            />
          </>
        )}
      </main>
      {editing && (
        <VendorEditorModal
          original={editing.vendor}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};
export default MANVNDPage;
