import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
// TODO: API 연동 시 아래 줄로 교체
// import { getAdminArticleDetail } from '@/api/manage/adminArticles';
import { getMockAdminArticleDetail } from '@/mocks/adminArticlesMock';
import { FILTER_OPTIONS } from '@/constants/filterOption';
import VendorAddModal from './VendorAddModal';
import AlertModal from '@/components/manage/common/AlertModal';
import TipTapEditor from './TipTapEditor';
import type { TipTapEditorHandle } from './TipTapEditor';
import { checkArticleIdDuplicate } from '@/api/manage/checkArticleIdDuplicate';

const ArticleEditorSection = ({
  articleId,
}: {
  articleId?: number | undefined;
}) => {
  const isEditing = articleId !== undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['adminArticleDetail', articleId],
    queryFn: () => getMockAdminArticleDetail(articleId!), // TODO: API 연동 시 → getAdminArticleDetail(articleId!)
    enabled: isEditing,
  });

  const [venderModalOpen, setVendorModalOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [idStatus, setIdStatus] = useState<
    'idle' | 'available' | 'taken' | 'unvalid'
  >('idle');
  const editorRef = useRef<TipTapEditorHandle>(null);
  const [editorKey, setEditorKey] = useState(isEditing ? 'pending' : 'new');
  const [form, setForm] = useState({
    category: '',
    title: '게시글 제목을 작성하세요',
    article_id: 0,
    start_date: '',
    due_date: '',
    vendors: [] as { vendor_id: number; vendor_name: string; original_url: string | null }[],
    content: '',
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      category: data.categories?.category_name ?? '',
      title: data.title,
      article_id: data.id,
      start_date: data.start_date.replace(/\./g, '-'),
      due_date: data.due_date.replace(/\./g, '-'),
      vendors: data.vendors.map(({ vendor_id, vendor_name, original_url }) => ({
        vendor_id,
        vendor_name,
        original_url,
      })),
      content: data.content,
    });
    setEditorKey(`loaded-${data.id}`);
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = () => {
    const content = editorRef.current?.getHTML();
    console.log({ ...form, content }); // TODO: API 연동 시 실제 제출 로직으로 교체
    setShowSubmitModal(false);
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

  if (isEditing && isLoading) {
    return <div className="mt-8 text-center text-gray-400 text-sm">불러오는 중...</div>;
  }

  const handleAlreadyCheck = async () => {
    // TODO: 실제 API 연결 시 아래 주석 해제
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

        <TipTapEditor key={editorKey} ref={editorRef} initialValue={form.content} />
        <button
          type="submit"
          disabled={idStatus !== 'available'}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          제출
        </button>
      </form>

      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <AlertModal
            title="이 내용으로 게시글을 등록하시겠습니까?"
            onConfirm={handleSubmitConfirm}
            onCancel={() => setShowSubmitModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleEditorSection;
