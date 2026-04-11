import { useState, useRef, useEffect } from 'react';
import { FILTER_OPTIONS } from '@/constants/filterOption';
import VendorAddModal from './VendorAddModal';
import TipTapEditor from './TipTapEditor';
import type { TipTapEditorHandle } from './TipTapEditor';
import { checkArticleIdDuplicate } from '@/api/manage/checkArticleIdDuplicate';
import { getAdminArticleDetail } from '@/api/manage/adminArticles';

const ArticleEditorSection = ({
  articleId,
}: {
  articleId?: number | undefined;
}) => {
  const defaultForm = {
    article_id: 0,
    category_id: 0,
    title: '게시글 제목을 입력하세요.',
    start_date: '',
    due_date: '',
    vendors: [] as {
      vendor_id: number;
      vendor_name: string;
      original_url: string | null;
    }[],
    content: '',
    attachments: [],
  };
  const isEditing = articleId !== undefined;
  const [isLoading, setIsLoading] = useState(isEditing);
  const [venderModalOpen, setVendorModalOpen] = useState(false);
  const [idStatus, setIdStatus] = useState<
    'idle' | 'available' | 'taken' | 'unvalid'
  >('idle');
  const editorRef = useRef<TipTapEditorHandle>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!isEditing) return;

    const fetchDetail = async () => {
      const res = await getAdminArticleDetail(1138);
      setForm({
        article_id: res.id,
        title: res.title,
        content: res.content,
        start_date: res.start_date,
        due_date: res.due_date,
        category_id: res.categories?.category_id ?? 0,
        vendors: res.vendors.map(
          ({ vendor_id, vendor_name, original_url }) => ({
            vendor_id,
            vendor_name,
            original_url,
          })
        ),
        attachments: res.attachments,
      });
      setIsLoading(false);
    };

    fetchDetail(); // 호출 추가
  }, [articleId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = editorRef.current?.getHTML();

    const categoryName =
      FILTER_OPTIONS.find((o) => o.category_id === form.category_id)?.label ??
      '미선택';
    alert(
      `카테고리 : ${categoryName} (id: ${form.category_id})\n제목 : ${form.title}\n행사기간 : ${form.start_date} ~ ${form.due_date}\n출처 : ${form.vendors.map((v) => `${v.vendor_name}(${v.original_url ?? '없음'})`).join(', ')}\n콘텐츠 : ${content}`
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

  const handleAlreadyCheck = async () => {
    if (typeof form.article_id !== 'number') {
      setIdStatus('unvalid');
      return;
    }
    const res = await checkArticleIdDuplicate(form.article_id);
    console.log(res);
    setIdStatus(res.data ? 'taken' : 'available');
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          {FILTER_OPTIONS.map((option) => {
            if (option.label === '북마크') return null;
            const isSelected = option.category_id === form.category_id;
            return (
              <label key={option.key}>
                <input
                  type="radio"
                  name="category"
                  value={option.category_id ?? ''}
                  checked={isSelected}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      category_id: option.category_id ?? 0,
                    }))
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
        <div className="flex flex-row gap-2">
          <label>
            ID :{' '}
            <input
              name="article_id"
              value={form.article_id}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  article_id: Number(e.target.value),
                }));
                setIdStatus('idle');
              }}
              className={`border rounded px-2 py-1 ${
                idStatus === 'taken'
                  ? 'border-red-500'
                  : idStatus === 'available'
                    ? 'border-green-500'
                    : 'border-gray-300'
              }`}
            />
          </label>
          {idStatus === 'taken' && (
            <p className="text-red-500 text-xs mt-0.5">
              이미 사용 중인 ID입니다.
            </p>
          )}
          {idStatus === 'unvalid' && (
            <p className="text-red-500 text-xs mt-0.5">
              적절하지 않은 입력입니다.
            </p>
          )}
          {idStatus === 'available' && (
            <p className="text-green-500 text-xs mt-0.5">
              사용 가능한 ID입니다.
            </p>
          )}
          <button
            type="button"
            onClick={handleAlreadyCheck}
            className="text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            중복검사
          </button>
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

        {isLoading ? (
          <div className="h-[400px] border border-gray-300 rounded-md flex items-center justify-center text-gray-400">
            불러오는 중...
          </div>
        ) : (
          <TipTapEditor ref={editorRef} initialValue={form.content} />
        )}
        <button
          type="submit"
          // disabled={idStatus !== 'available'}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          제출
        </button>
      </form>
    </div>
  );
};

export default ArticleEditorSection;
