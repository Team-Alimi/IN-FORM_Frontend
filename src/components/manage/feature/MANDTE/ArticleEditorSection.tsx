import { useState } from 'react';
import type { ArticleDetail } from '@/api/manage/adminArticles';
import { FILTER_OPTIONS } from '@/constants/filterOption';

const ArticleEditorSection = () => {
  const mockArticleDetail: ArticleDetail = {
    id: 101,
    title: '[학부] 2026년 상반기 SW전공 역량강화 프로그램 참가자 모집',
    content: '<p>2026년 상반기 SW전공 역량강화 프로그램...</p>',
    is_published: false,
    admin_status: 'INSPECTED_YET',
    previous_status: null,
    start_date: '2026.03.24',
    due_date: '2026.04.10',
    created_at: '2026-03-20T09:00:00',
    updated_at: '2026-03-20T09:00:00',
    categories: { category_id: 1, category_name: '대회/공모전' },
    vendors: [
      {
        vendor_id: 1,
        vendor_name: '컴퓨터공학과',
        vendor_initial: '컴',
        vendor_type: 'DEPARTMENT',
        original_url: null,
      },
    ],
    attachments: [],
    last_modified_admin: null,
    admin_modified_at: null,
  };

  const [form, setForm] = useState({
    category: mockArticleDetail.categories?.category_name ?? '',
    title: mockArticleDetail.title,
    article_id: mockArticleDetail.id,
    start_date: mockArticleDetail.start_date.replace(/\./g, '-'),
    due_date: mockArticleDetail.due_date.replace(/\./g, '-'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(
      `선택된 카테고리 : ${form.category}\n작성한 타이틀 : ${form.title}\n선택된 시작일 : ${form.start_date} 종료일 : ${form.due_date}`
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          {FILTER_OPTIONS.map((option) => {
            if (option.label === '북마크') return null;
            const isSelected = option.label === form.category;
            return (
              <label key={option.key}>
                <input
                  type="radio"
                  name="category"
                  value={option.label}
                  checked={isSelected}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, category: option.label }))
                  }
                  className="hidden"
                />
                <span
                  className={`cursor-pointer px-3 py-1 rounded-sm text-sm mr-2 ${isSelected ? `${option.color} text-white` : 'bg-gray-100 text-gray-600'}`}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
        <div>
          <input
            name="title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            className="text-lg w-4/5"
          />
        </div>

        {/**1. 드롭다운을 통해 새로운 출처명과 출처 url을 입력 받는다.*/}
        {/**2. 입력을 통해 받은 출처 정보를 기존 vendors 배열에 추가한다.*/}
        <div>
          <label>
            ID :{' '}
            <input
              name="article_id"
              value={form.article_id}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  article_id: Number(e.target.value),
                }))
              }
            />
          </label>
          <label>
            행사기간 :{' '}
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, start_date: e.target.value }))
              }
            />{' '}
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, due_date: e.target.value }))
              }
            />
          </label>
        </div>

        <button type="submit">검색</button>
      </form>
    </div>
  );
};

export default ArticleEditorSection;
