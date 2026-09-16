import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getMockAdminArticleDetail } from '@/mocks/adminArticlesMock';
import { CATEGORY_NAME_COLOR_MAP } from '@/constants/filterOption';
import { fetchCategories } from '@/api/main/vendors';
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
import { MOCK_MANAGE_ARTICLE_DETAIL } from '@/mocks/adminArticleDetailTest';
import type {
  OManageArticleDetail,
  IUpdateArticlePayload,
  IRegisterArticlePayload,
} from '@/api/manage/dto/adminDto';

export type FormCategory = {
  category_id: number;
  category_name: string;
  category_key: string | undefined; //🥚추후 확인 필요
};
export type FormVendor = {
  vendor_id: number; //학과정의용 id
  id?: number | null; //기존 vendor는 아이디도 같이 payload에 실어서 보냄/ 신규의 경우 보내지않음(비움)
  vendor_name: string;
  source_url: string;
};
export type FormAttachment = {
  id?: number | null; //기존 attachment는 아이디도 같이 payload에 실어서 보냄/ 신규의 경우 보내지않음(비움)
  file_url?: string | undefined;
  original_name?: string | null | undefined;
  content_type?: string | null | undefined;
};

const ArticleEditorSection = ({
  articleId,
  sourceType,
}: {
  articleId?: number; //articleId 값이 있다 : 게시글 수정하기 articleId값이 없다 : 게시글 등록하기
  sourceType: string; //SCHOOL OR CLUB [현재는 우선 SCHOOL으로 구성 ]
}) => {
  const isEditing = articleId !== undefined; //articleId 의 값이 있다면 isEditing : true, 수정중이 맞다.
  const navigate = useNavigate();
  /** 🧐 - API 연동 추후 수정
  const { data, isLoading } = useQuery({
    //articleId를 기반으로
    queryKey: ['adminArticleDetail', articleId],
    queryFn: () => getMockAdminArticleDetail(articleId!), // TODO: API 연동 시 → getAdminArticleDetail(articleId!)
    enabled: isEditing, //isEditing이 true일때만 내용을 실행하라.
  });
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 60 * 60 * 1000,
  }); 
*/
  // const categories = (categoriesData?.data ?? []) as {
  //   id: number;
  //   name: string;
  // }[];  🧐 - API 연동 후 살려야됨
  const data = MOCK_MANAGE_ARTICLE_DETAIL;
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
    categories: [] as FormCategory[],
    title: '게시글 제목을 입력하세요.',
    article_id: -1,
    admin_status: 'PENDING_REVIEW',
    starts_on: '',
    ends_on: '',
    vendors: [] as FormVendor[],
    created_at: '',
    updated_at: '',
    content: '',
    attachments: [] as FormAttachment[],
  });
  const TEMP_SOURCE_TYPE = 'SCHOOL'; //우선 공지 게시글 수정으로 구현

  useEffect(() => {
    if (!data) return;
    setForm({
      categories:
        data.data?.categories.map((item) => ({
          category_id: item.id,
          category_name: item.name,
          category_key: undefined,
        })) ?? [],
      title: data.data?.title,
      content: data.data?.content,
      article_id: data?.data.id,
      admin_status: data.data?.status, //PENDING_REVIEW
      starts_on: data.data?.starts_on,
      ends_on: data.data?.ends_on,
      vendors: data.data?.vendors.map((item) => ({
        id: item.id,
        vendor_id: item.vendor_id, //학과 매핑 아이디
        vendor_name: item.vendor_name,
        source_url: item.source_url,
      })),
      created_at: data.data?.created_at,
      updated_at: data.data?.updated_at,
      attachments: data.data?.attachments.map((item) => ({
        id: item.id,
        file_url: item.file_url,
        original_name: item.original_name,
        content_type: item.content_type,
      })),
    });
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //제출 확인 모달 제어
    e.preventDefault();
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = async () => {
    const content = editorRef.current?.getHTML() ?? '';
    //게시글 수정하기
    try {
      if (isEditing) {
        const payload: IUpdateArticlePayload = {
          title: form.title,
          content: form.content,
          starts_on: form.starts_on,
          ends_on: form.ends_on,
          category_ids: form.categories.map((item) => item.category_id),
          vendors: form.vendors.map((item) => ({
            id: item.id ?? null,
            vendor_id: item.vendor_id,
            vendor_name: item.vendor_name,
            source_url: item.source_url,
          })),
          attachments: form.attachments.map((item) => ({
            id: item.id ?? null,
            file_url: item.file_url,
            original_name: item.original_name,
            content_type: item.content_type,
          })),
          //🥚상태 수정 관련 항목이 안보인다. 확인필요
        };
        console.log('[🧐게시글 수정하기] 제출되었습니다.', payload);
        //await updateArticle(articleId!, payload); 🧐[추후API]
      } else {
        //게시글 신규 등록하기
        const payload: IRegisterArticlePayload = {
          article_id: form.article_id ?? null,
          source_type: TEMP_SOURCE_TYPE,
          status: form.admin_status,
          title: form.title,
          content: form.content,
          starts_on: form.starts_on,
          ends_on: form.ends_on,
          category_ids: form.categories.map((item) => item.category_id),
          vendors: form.vendors.map((item) => ({
            id: item.id ?? null,
            vendor_id: item.vendor_id,
            vendor_name: item.vendor_name,
            source_url: item.source_url,
          })),
          attachments: form.attachments.map((item) => ({
            id: item.id ?? null,
            file_url: item.file_url,
            original_name: item.original_name,
            content_type: item.content_type,
          })),
        };
        //await createArticle(payload); 🧐[추후API]
        console.log('[🧐게시글 등록하기] 제출되었습니다.', payload);
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

  const handleVendorAdd = (
    vendor_id: number,
    name: string,
    url: string,
    id: number | null = null // 신규 vendor는 아직 서버에 없으므로 id를 비워서(null) 둔다
  ) => {
    const NewVendor: FormVendor = {
      vendor_id: vendor_id,
      id: id,
      vendor_name: name,
      source_url: url,
    };
    setForm((prev) => ({ ...prev, vendors: [...prev.vendors, NewVendor] }));
    setVendorModalOpen(false);
  };

  const handleVendorModalToggle = () => {
    setVendorModalOpen((prev) => !prev);
  };

  const handleAttachmentAdd = (
    file_url: string,
    original_name?: string,
    content_type?: string,
    id: number | null = null
  ) => {
    const NewAttachment: FormAttachment = {
      id: id,
      file_url: file_url,
      original_name: original_name,
      content_type: content_type,
    };

    setForm((prev) => ({
      ...prev,
      attachment_urls: [...prev.attachments, NewAttachment],
    }));
    setAttachmentModalOpen(false);
  };

  const handleAttachmentDelete = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attachment_urls: prev.filter((item) => item.file_url !== index),
    }));
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

  if (isEditing) {
    return (
      <div className="mt-8 text-center text-gray-400 text-sm">
        불러오는 중...
      </div>
    );
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/**
         * <1> 게시글 분류 카테고리 선택 목록 배열
         *  - 필수로 한개의 카테고리 선택 필요
         */}
        <div>
          {categories.map((cat) => {
            const isSelected = cat.id === form.category_id;
            const colorBg =
              CATEGORY_NAME_COLOR_MAP[cat.name]?.dot ?? 'bg-gray-400';
            return (
              <label key={cat.id}>
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={isSelected}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      category_id: cat.id,
                    }))
                  }
                  className="hidden"
                />
                <span
                  className={`cursor-pointer px-3 py-1 rounded-sm text-sm mr-2 ${isSelected ? `${colorBg} text-white` : 'bg-gray-100 text-gray-600'}`}
                >
                  {cat.name}
                </span>
              </label>
            );
          })}
        </div>
        {/**
         * <2> 게시글 제목 입력 폼
         *  - 게시글 이름 문자열 입력 필수
         */}
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

        {/**
         * <3> 게시글 출처 입력 폼
         *  - 출처 입력 필수
         */}
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

        {/**
         * <4> 첨부파일 입력 폼
         *  - 첩부파일 필수 x
         */}
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
        {/**
         * <5> id입력 폼
         *  - 필수 입력 + 중복 검사 True
         */}
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
        </div>
        {/**
         * <6> 행사 기간 입력 폼
         *  - 필수 입력
         */}
        <div>
          <label>
            행사기간 :{' '}
            <input
              type="date"
              name="start_date"
              value={form.starts_on}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, start_date: e.target.value }))
              }
            />{' '}
            <input
              type="date"
              name="due_date"
              value={form.ends_on}
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
