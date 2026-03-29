import type { Article } from '@/api/manage/adminArticles';

interface TableListRecordProps {
  article: Article;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  selected?: boolean;
  onClick?: () => void;
}

const TableListRecord = ({
  article,
  checked,
  onCheck,
  selected = false,
  onClick,
}: TableListRecordProps) => {
  const {
    article_id,
    title,
    start_date,
    due_date,
    categories,
    vendors,
    updated_at,
  } = article;

  // "인하대학교 외 2" 형태로 출처 표시
  const vendorLabel =
    vendors.length === 0
      ? '-'
      : vendors.length === 1
        ? (vendors[0]?.vendor_name ?? '-')
        : `${vendors[0]?.vendor_name ?? '-'} 외 ${vendors.length - 1}`;

  const period = `${start_date} ~ ${due_date}`;

  // "2026-03-25T10:30:00" → "2026.03.25"
  const formattedDate = updated_at.slice(0, 10).replace(/-/g, '.');

  return (
    <tr
      onClick={onClick}
      className={`text-sm border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
        selected ? 'outline outline-2 outline-blue-400' : ''
      }`}
    >
      {/* 선택 */}
      <td className="px-3 py-3 text-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onCheck(e.target.checked);
          }}
          className="w-4 h-4 accent-blue-500"
        />
      </td>

      {/* 게시글 ID */}
      <td className="px-3 py-3 text-center text-gray-600">{article_id}</td>

      {/* 카테고리 */}
      <td className="px-3 py-3 text-center text-gray-600">
        {categories?.category_name ?? '-'}
      </td>

      {/* 게시글 제목 */}
      <td className="px-3 py-3 text-gray-800 max-w-[180px]">
        <p className="truncate">{title}</p>
      </td>

      {/* 행사기간 */}
      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{period}</td>

      {/* 출처 */}
      <td className="px-3 py-3 text-gray-600">{vendorLabel}</td>

      {/* 게시글 최종 수정일 */}
      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{formattedDate}</td>
    </tr>
  );
};

export default TableListRecord;
