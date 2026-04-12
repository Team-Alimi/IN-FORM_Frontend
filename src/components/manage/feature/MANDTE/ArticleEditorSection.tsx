import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getMockAdminArticleDetail } from '@/mocks/adminArticlesMock';
import { FILTER_OPTIONS } from '@/constants/filterOption';
import VendorAddModal from './VendorAddModal';
import AttachmentAddModal from './AttachmentAddModal';
import AlertModal from '@/components/manage/common/AlertModal';
import TipTapEditor from './TipTapEditor';
import type { TipTapEditorHandle } from './TipTapEditor';
import { checkArticleIdDuplicate } from '@/api/manage/checkArticleIdDuplicate';
import {
  createArticle,
  updateArticle,
  deleteArticles,
} from '@/api/manage/adminArticles';
import type {
  CreateArticlePayload,
  UpdateArticlePayload,
  AdminStatus,
} from '@/api/manage/adminArticles';

const ArticleEditorSection = ({
  articleId,
}: {
  articleId?: number | undefined; //articleId 값이 있다 : 게시글 수정하기 articleId값이 없다 : 게시글 등록하기
}) => {
  const isEditing = articleId !== undefined; //articleId 의 값이 있다면 isEditing : true, 수정중이 맞다.
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    //articleId를 기반으로
    queryKey: ['adminArticleDetail', articleId],
    queryFn: () => getMockAdminArticleDetail(articleId!), // TODO: API 연동 시 → getAdminArticleDetail(articleId!)
    enabled: isEditing, //isEditing이 true일때만 내용을 실행하라.
  });

  const [venderModalOpen, setVendorModalOpen] = useState(false); //vendor모달 토글 상태 관리
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false); //attachment모달 토글 상태 관리
  const [showSubmitModal, setShowSubmitModal] = useState(false); //제출 모달 노출 상태 관리
  const [showDeleteModal, setShowDeleteModal] = useState(false); //삭제 모달 노출 상태 관리
  const [idStatus, setIdStatus] = useState<
    'idle' | 'available' | 'taken' | 'unvalid'
  >('idle'); //id 중복 확인 및 유효성 검사 state
  const editorRef = useRef<TipTapEditorHandle>(null);
  const [editorKey, setEditorKey] = useState(isEditing ? 'pending' : 'new');
  const [form, setForm] = useState({
    category_id: 0,
    title: '게시글 제목을 작성하세요',
    article_id: 0,
    admin_status: 'REFLECTION_WAITING' as AdminStatus,
    start_date: '',
    due_date: '',
    vendors: [] as {
      vendor_id: number;
      vendor_name: string;
      original_url: string | null;
    }[],
    content: '',
    attachment_urls: [] as string[],
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      category_id: data.categories?.category_id ?? 0,
      title: data.title,
      article_id: data.id,
      admin_status: (data.admin_status ?? 'REFLECTION_WAITING') as AdminStatus,
      start_date: data.start_date,
      due_date: data.due_date,
      vendors: data.vendors.map(({ vendor_id, vendor_name, original_url }) => ({
        vendor_id,
        vendor_name,
        original_url,
      })),
      content: data.content,
      attachment_urls: data.attachments.map((a) => a.attachment_url),
    });
    setEditorKey(`loaded-${data.id}`);
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //제출 확인 모달 제어
    e.preventDefault();
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = async () => {
    const content = editorRef.current?.getHTML() ?? '';

    try {
      if (isEditing) {
        const payload: UpdateArticlePayload = {
          title: form.title,
          content,
          category_id: form.category_id,
          admin_status: form.admin_status,
          start_date: form.start_date,
          due_date: form.due_date,
          vendors: form.vendors.map(({ vendor_id, original_url }) => ({
            vendor_id,
            original_url: original_url ?? '',
          })),
          attachment_urls: form.attachment_urls,
        };
        await updateArticle(articleId!, payload);
      } else {
        const payload: CreateArticlePayload = {
          article_id: form.article_id,
          title: form.title,
          content,
          category_id: form.category_id,
          start_date: form.start_date,
          due_date: form.due_date,
          vendors: form.vendors.map(({ vendor_id, original_url }) => ({
            vendor_id,
            original_url: original_url ?? '',
          })),
          attachment_urls: form.attachment_urls,
        };
        await createArticle(payload);
      }
      navigate('/manage');
    } catch {
      alert(
        isEditing
          ? '게시글 수정에 실패했습니다. 다시 시도해주세요.'
          : '게시글 등록에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setShowSubmitModal(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteArticles([articleId!]);
      navigate('/manage');
    } catch {
      alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleVendorDelete = (id: number) => {
    //선택된 vendor를 삭제 하는 핸들러
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

  const handleAttachmentAdd = (url: string) => {
    setForm((prev) => ({
      ...prev,
      attachment_urls: [...prev.attachment_urls, url],
    }));
    setAttachmentModalOpen(false);
  };

  const handleAttachmentDelete = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attachment_urls: prev.attachment_urls.filter((_, i) => i !== index),
    }));
  };

  if (isEditing && isLoading) {
    return (
      <div className="mt-8 text-center text-gray-400 text-sm">
        불러오는 중...
      </div>
    );
  }

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

        {/* 출처 섹션 */}
        <div className="flex flex-row gap-2 flex-wrap">
          {form.vendors.map((item) => (
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
          ))}
          <div
            className="text-3xl p-1 px-3 bg-gray-100 rounded-md cursor-pointer"
            onClick={handleVendorModalToggle}
          >
            +
          </div>
        </div>
        {venderModalOpen && <VendorAddModal onConfirm={handleVendorAdd} />}

        {/* 첨부파일 섹션 */}
        <div className="flex flex-row gap-2 flex-wrap">
          {form.attachment_urls.map((url, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-700"
            >
              {url.split('/').pop() || url}
              <button
                type="button"
                className="cursor-pointer text-gray-400 hover:text-gray-600 leading-none"
                onClick={() => handleAttachmentDelete(index)}
              >
                ×
              </button>
            </div>
          ))}
          <div
            className="text-sm p-1 px-3 bg-gray-100 rounded-md cursor-pointer"
            onClick={() => setAttachmentModalOpen(true)}
          >
            첨부파일 추가하기 +
          </div>
        </div>
        {attachmentModalOpen && (
          <AttachmentAddModal
            onConfirm={handleAttachmentAdd}
            onCancel={() => setAttachmentModalOpen(false)}
          />
        )}

        <div className="flex flex-row gap-2">
          {!isEditing && (
            <>
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
            </>
          )}
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

        <TipTapEditor
          key={editorKey}
          ref={editorRef}
          initialValue={form.content}
        />
        <button
          type="submit"
          // disabled={idStatus !== 'available'}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isEditing ? '반영하기' : '추가하기'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-100 text-red-400 rounded hover:bg-red-200 m-4"
          >
            삭제하기
          </button>
        )}
      </form>

      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <AlertModal
            title={
              isEditing
                ? '이 내용으로 게시글을 수정하시겠습니까?'
                : '이 내용으로 게시글을 등록하시겠습니까?'
            }
            onConfirm={handleSubmitConfirm}
            onCancel={() => setShowSubmitModal(false)}
          />
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <AlertModal
            title="해당 게시글을 삭제하시겠습니까?"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeleteModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleEditorSection;
