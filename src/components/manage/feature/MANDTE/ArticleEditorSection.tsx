import { useState, useEffect, useRef } from 'react';
import type { ArticleDetail } from '@/api/manage/adminArticles';
import { FILTER_OPTIONS } from '@/constants/filterOption';
import VendorAddModal from './VendorAddModal';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
const ArticleEditorSection = ({
  articleId,
}: {
  articleId?: number | undefined;
}) => {
  const isEditing = articleId !== undefined;
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
        vendor_name: '컴퓨터공학과컴퓨터공학과',
        vendor_initial: '컴',
        vendor_type: 'DEPARTMENT',
        original_url: null,
      },
    ],
    attachments: [],
    last_modified_admin: null,
    admin_modified_at: null,
  };
  const [venderModalOpen, setVendorModalOpen] = useState(false);
  const [form, setForm] = useState(
    isEditing
      ? {
          category: mockArticleDetail.categories?.category_name ?? '',
          title: mockArticleDetail.title,
          article_id: mockArticleDetail.id,
          start_date: mockArticleDetail.start_date.replace(/\./g, '-'),
          due_date: mockArticleDetail.due_date.replace(/\./g, '-'),
          vendors: mockArticleDetail.vendors.map(
            ({ vendor_id, vendor_name, original_url }) => ({
              vendor_id,
              vendor_name,
              original_url,
            })
          ),
          content: mockArticleDetail.content,
        }
      : {
          category: '',
          title: '게시글 제목을 작성하세요',
          article_id: 0,
          start_date: '',
          due_date: '',
          vendors: [],
          content: '',
        }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = editorInstanceRef.current?.getHTML();

    alert(
      `선택된 카테고리 : ${form.category}\n작성한 타이틀 : ${form.title}\n선택된 시작일 : ${form.start_date} 종료일 : ${form.due_date}\n출처목록 : ${form.vendors.map((v) => `${v.vendor_name}(${v.original_url ?? '없음'})`).join(', ')}\n콘텐츠${content}`
    );
  };

  const handleVendorDelete = (id: number) => {
    setForm((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((item) => item.vendor_id !== id),
    }));
  };

  const handleVendorAdd = (id: number, name: string, url: string) => {
    const NewVendor = {
      vendor_id: id,
      vendor_name: name,
      original_url: url,
    };
    setForm((prev) => ({ ...prev, vendors: [...prev.vendors, NewVendor] }));
    setVendorModalOpen(false);
  };

  const handleVendorModalToggle = () => {
    setVendorModalOpen((prev) => !prev);
  };

  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  useEffect(() => {
    if (!editorRef.current) return;
    const editor = new Editor({
      el: editorRef.current,
      height: '500px',
      initialEditType: 'wysiwyg',
      previewStyle: 'vertical',
    });
    editorInstanceRef.current = editor;
    return () => editor.destroy();
  }, []);

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
        {/**1. 출처 배열 정보를 모두 나열한다. */}
        <div className="flex flex-row gap-2">
          {form.vendors.map((item) => {
            {
              return (
                <div
                  key={item.vendor_id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-700"
                >
                  {item.vendor_name}
                  <button
                    type="button"
                    className="cursor-pointer text-gray-400 hover:text-gray-600 leading-none"
                    onClick={() => handleVendorDelete(item.vendor_id)}
                  >
                    ×
                  </button>
                </div>
              );
            }
          })}
          {/**2. 출처 배열의 끝에 +버튼을 구현한다. */}
          <div
            className="text-3xl p-1 px-3 bg-gray-100 rounded-md"
            onClick={handleVendorModalToggle}
          >
            +
          </div>
        </div>
        {/**3. + 버튼을 누르면 모달이 노출되며 사용자는 출처명과 출처 url을 입력한다. */}
        {venderModalOpen && <VendorAddModal onConfirm={handleVendorAdd} />}
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
        <div ref={editorRef}></div>
        <button type="submit">제출</button>
      </form>
    </div>
  );
};

export default ArticleEditorSection;
