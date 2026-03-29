import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// TODO: API 연동 시 아래 두 줄로 교체
// import { getAdminArticles } from '@/api/manage/adminArticles';
import { getMockAdminArticles } from '@/mocks/adminArticlesMock';
import type { AdminStatus } from '@/api/manage/adminArticles';
import TableListRecord from './TableListRecord';
import ActionBtn from './ActionBtn';
import MovePageBtn from './MovePageBtn';

interface ActionItem {
  label: string;
  color?: string;
  onClick: (checkedIds: number[]) => void;
}

interface TableListProps {
  status: AdminStatus;
  title: string;
  actions?: ActionItem[];
  previousStatusFilter?: string | null; // 설정 시 해당 previous_status인 게시글만 표시
}

const COLUMNS = ['선택', '게시글 ID', '카테고리', '게시글 제목', '행사기간', '출처', '게시글 최종 수정일'];

const TableList = ({ status, title, actions = [], previousStatusFilter }: TableListProps) => {
  const [page, setPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data } = useQuery({
    queryKey: ['adminArticles', status, page],
    queryFn: () => getMockAdminArticles(status, page), // TODO: API 연동 시 → () => getAdminArticles(status, page)
  });

  const allArticles = data?.articles ?? [];
  const totalPages = data?.page_info.total_pages ?? 1;

  // previousStatusFilter가 있으면 해당 previous_status로 필터링
  const articles =
    previousStatusFilter !== undefined
      ? allArticles.filter((a) => a.previous_status === previousStatusFilter)
      : allArticles;

  // 전체선택 체크박스 상태
  const allChecked = articles.length > 0 && articles.every((a) => checkedIds.has(a.article_id));
  const someChecked = articles.some((a) => checkedIds.has(a.article_id));

  const handleCheckAll = (checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      articles.forEach((a) => (checked ? next.add(a.article_id) : next.delete(a.article_id)));
      return next;
    });
  };

  const handleCheck = (id: number, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mt-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="font-semibold text-gray-800">{title}</span>
        <div className="flex gap-3">
          {actions.map((action) => (
            <ActionBtn
              key={action.label}
              label={action.label}
              {...(action.color ? { color: action.color } : {})}
              onClick={() => action.onClick(Array.from(checkedIds))}
            />
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <th className="px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked && !allChecked;
                  }}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-4 h-4 accent-blue-500"
                />
              </th>
              {COLUMNS.slice(1).map((col) => (
                <th key={col} className="px-3 py-3 text-left font-medium whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <TableListRecord
                key={article.article_id}
                article={article}
                checked={checkedIds.has(article.article_id)}
                onCheck={(checked) => handleCheck(article.article_id, checked)}
                selected={selectedId === article.article_id}
                onClick={() => setSelectedId(article.article_id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <MovePageBtn page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default TableList;
