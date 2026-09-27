import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import type { AdminVendor } from '@/api/manage/vendors';
import { getVendorHomepage } from '@/utils/manage/vendorForm';

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
        .format(date)
        .replaceAll('-', '.');
};
const VendorTable = ({
  data,
  page,
  pending,
  error,
  fetching,
  onPage,
  onEdit,
  onRetry,
}: {
  data: AdminVendor[] | undefined;
  page: number;
  pending: boolean;
  error: boolean;
  fetching: boolean;
  onPage: (page: number) => void;
  onEdit: (vendor: AdminVendor) => void;
  onRetry: () => void;
}) => {
  const totalPages = Math.ceil((data?.length ?? 0) / 8);
  const rows = data?.slice((page - 1) * 8, page * 8) ?? [];
  return (
    <section aria-label="제공처 목록" aria-busy={fetching} className="mt-6">
      <h2 className="mb-3 text-sm font-bold">
        제공처 목록{' '}
        <span className="text-gray-400">
          ({data && !error ? `${data.length.toLocaleString()}개` : '—'})
        </span>
      </h2>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {pending ? (
          <p role="status" className="p-12 text-center text-sm text-gray-500">
            제공처를 불러오는 중입니다.
          </p>
        ) : error ? (
          <p role="alert" className="p-12 text-center text-sm">
            제공처 목록을 불러오지 못했습니다.{' '}
            <button onClick={onRetry} className="underline">
              다시 시도
            </button>
          </p>
        ) : !rows.length ? (
          <p className="p-12 text-center text-sm text-gray-500">
            조회된 제공처가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] table-fixed text-left text-xs">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[15%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
                <col className="w-[38%]" />
                <col className="w-[7%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead className="border-b border-gray-100 bg-[#F7F8FA] text-gray-600">
                <tr>
                  {[
                    '제공처 ID',
                    '제공처 이름',
                    '식별자 (initial)',
                    '유형',
                    '홈페이지 URL',
                    '활성 여부',
                    '등록 일시',
                    '관리',
                  ].map((label) => (
                    <th
                      scope="col"
                      key={label}
                      className="whitespace-nowrap px-4 py-5 font-medium"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((vendor) => {
                  const url = getVendorHomepage(vendor.homepage_url);
                  return (
                    <tr
                      key={vendor.id}
                      className="h-[70px] border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 font-semibold">{vendor.id}</td>
                      <td className="break-words px-4 font-medium">
                        {vendor.name}
                      </td>
                      <td className="break-all px-4 font-mono text-[11px] text-gray-500">
                        {vendor.initial}
                      </td>
                      <td className="px-4">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] ${vendor.type === 'SCHOOL' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}
                        >
                          {vendor.type}
                        </span>
                      </td>
                      <td className="break-all px-4">
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {vendor.homepage_url}{' '}
                            <RiExternalLinkLine
                              aria-label="새 창"
                              className="inline-block"
                            />
                          </a>
                        ) : (
                          <span className="text-gray-400">
                            {vendor.homepage_url || '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-4">
                        <span
                          title={
                            vendor.is_active
                              ? '목록과 필터에 표시됩니다.'
                              : '목록과 필터에서 숨겨집니다. 수집 중단은 아닙니다.'
                          }
                          className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] ${vendor.is_active ? 'border border-emerald-200 bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {vendor.is_active ? '활성' : '숨김'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 text-gray-400">
                        {formatDate(vendor.created_at)}
                      </td>
                      <td className="px-4">
                        <button
                          aria-label={`${vendor.name} (#${vendor.id}) 수정`}
                          disabled={fetching}
                          onClick={() => onEdit(vendor)}
                          className="whitespace-nowrap rounded-full border border-gray-200 px-2 py-1 disabled:opacity-40"
                        >
                          수정
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!error && totalPages > 0 && (
          <nav
            aria-label="제공처 목록 페이지"
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
              (_, i) => Math.max(1, Math.min(page - 2, totalPages - 4)) + i
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
              disabled={fetching || page >= totalPages}
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
export default VendorTable;
