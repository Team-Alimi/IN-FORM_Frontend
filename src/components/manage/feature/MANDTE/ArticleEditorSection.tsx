import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri';
import {
  checkEditorArticleId,
  discardEditorFiles,
  editorErrorMessage,
  findEditorDuplicates,
  getEditorCategories,
  getEditorVendors,
  saveEditorArticle,
  uploadEditorFiles,
} from '@/api/manage/articleEditor';
import type {
  ArticleAttachment,
  ArticleVendor,
  ArticleWritePayload,
  EditableArticle,
  SourceType,
} from '@/api/manage/articleEditor';
import type { ReviewStatus } from '@/api/manage/dashboard';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import TipTapEditor from './TipTapEditor';
import type { TipTapEditorHandle } from './TipTapEditor';
import EditorDialog from './EditorDialog';
import ManageNavigation from '@/components/manage/common/ManageNavigation';

const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING_REVIEW: '미검수',
  READY_TO_PUBLISH: '반영대기',
  DRAFT: '임시저장',
  PUBLISHED: '운영',
  TRASHED: '휴지통',
};
const INPUT =
  'min-w-0 rounded-lg border border-gray-100 bg-[#F8F9FA] px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:text-gray-400';
const BUTTON =
  'rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm disabled:opacity-40';
const FieldRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="grid grid-cols-[112px_minmax(0,1fr)] items-start gap-0 border-t border-gray-100 px-5 py-4 max-mobile:grid-cols-1 max-mobile:gap-3">
    <div className="pt-2 text-sm text-gray-700">{label}</div>
    <div className="min-w-0">{children}</div>
  </div>
);

const ArticleEditorSection = ({ initial }: { initial?: EditableArticle }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<TipTapEditorHandle>(null);
  const operationRef = useRef(false);
  const [processing, setProcessing] = useState(false);
  const leaveRef = useRef<() => void>(() => navigate('/manage'));
  const [sourceType, setSourceType] = useState<SourceType>(
    initial?.source_type ?? 'SCHOOL'
  );
  const [articleId, setArticleId] = useState('');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [categoryIds, setCategoryIds] = useState(
    initial?.categories.map((item) => item.id) ?? []
  );
  const [vendors, setVendors] = useState<ArticleVendor[]>(
    initial?.vendors ?? []
  );
  const [attachments, setAttachments] = useState<ArticleAttachment[]>(
    initial?.attachments ?? []
  );
  const [startsOn, setStartsOn] = useState(initial?.starts_on ?? '');
  const [endsOn, setEndsOn] = useState(initial?.ends_on ?? '');
  const [status, setStatus] = useState<ReviewStatus>(
    initial?.status ?? 'PENDING_REVIEW'
  );
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<'save' | 'cancel' | 'vendor' | null>(
    null
  );
  const [vendorId, setVendorId] = useState('');
  const [vendorUrl, setVendorUrl] = useState('');
  const [vendorError, setVendorError] = useState('');
  const [pendingPayload, setPendingPayload] =
    useState<ArticleWritePayload | null>(null);
  const categories = useQuery({
    queryKey: ['adminEditor', 'categories'],
    queryFn: getEditorCategories,
    retry: shouldRetryDashboardQuery,
  });
  const vendorOptions = useQuery({
    queryKey: ['adminEditor', 'vendors', sourceType],
    queryFn: () => getEditorVendors(sourceType),
    retry: shouldRetryDashboardQuery,
  });
  const idCheck = useQuery({
    queryKey: ['adminEditor', 'idCheck', articleId],
    queryFn: () => checkEditorArticleId(Number(articleId)),
    enabled: false,
    retry: false,
  });
  const duplicates = useQuery({
    queryKey: ['adminEditor', 'duplicates', title.trim()],
    queryFn: () => findEditorDuplicates(title.trim()),
    enabled: false,
    retry: false,
  });
  const cleanup = useMutation({ mutationFn: discardEditorFiles });
  const upload = useMutation({ mutationFn: uploadEditorFiles });
  const save = useMutation({
    mutationFn: (payload: ArticleWritePayload) =>
      saveEditorArticle(payload, initial?.id),
  });
  const busy =
    processing || save.isPending || upload.isPending || cleanup.isPending;
  const forbidden = [
    categories.error,
    vendorOptions.error,
    save.error,
    upload.error,
    cleanup.error,
    idCheck.error,
    duplicates.error,
  ].some(isDashboardForbidden);
  useEffect(() => {
    const handleUnload = (event: BeforeUnloadEvent) => {
      if (dirty || busy) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [dirty, busy]);
  const handleNavigate = (proceed: () => void) => {
    if (busy || operationRef.current) return;
    leaveRef.current = proceed;
    if (dirty) setDialog('cancel');
    else proceed();
  };
  const handleCancel = () => handleNavigate(() => navigate('/manage'));
  const handleDiscard = async () => {
    if (operationRef.current) return;
    operationRef.current = true;
    setProcessing(true);
    setError('');
    try {
      const urls = attachments
        .filter((item) => item.id === undefined)
        .map((item) => item.file_url);
      if (urls.length) await cleanup.mutateAsync(urls);
      setDirty(false);
      leaveRef.current();
    } catch {
      setError('업로드 파일 정리 요청에 실패했습니다. 다시 취소해 주세요.');
      setDialog(null);
    } finally {
      operationRef.current = false;
      setProcessing(false);
    }
  };
  const handleUpload = async (files: File[]) => {
    if (operationRef.current || !files.length) return;
    setError('');
    if (attachments.length + files.length > 20) {
      setError('이미지는 최대 20개까지 첨부할 수 있습니다.');
      return;
    }
    if (files.some((file) => !/\.(jpe?g|png|gif|webp)$/i.test(file.name))) {
      setError('jpg, jpeg, png, gif, webp 이미지만 업로드할 수 있습니다.');
      return;
    }
    if (
      files.some((file) => file.size <= 0 || file.size > 10 * 1024 * 1024) ||
      files.reduce((sum, file) => sum + file.size, 0) > 60 * 1024 * 1024
    ) {
      setError(
        '빈 파일은 업로드할 수 없으며, 파일당 10MB·한 번에 60MB까지 가능합니다.'
      );
      return;
    }
    if (files.some((file) => file.name.length > 255)) {
      setError('파일 이름은 255자 이내여야 합니다.');
      return;
    }
    operationRef.current = true;
    setProcessing(true);
    try {
      const results = await upload.mutateAsync(files);
      setAttachments((current) => [...current, ...results]);
      setDirty(true);
      editorRef.current?.insertImages(results);
    } catch (cause) {
      setError(
        editorErrorMessage(
          cause,
          '이미지를 업로드하지 못했습니다. 다시 시도해 주세요.'
        )
      );
    } finally {
      operationRef.current = false;
      setProcessing(false);
    }
  };
  const handleRemoveAttachment = async (attachment: ArticleAttachment) => {
    if (operationRef.current) return;
    operationRef.current = true;
    setProcessing(true);
    setError('');
    try {
      if (attachment.id === undefined)
        await cleanup.mutateAsync([attachment.file_url]);
      setAttachments((current) =>
        current.filter((item) => item !== attachment)
      );
      editorRef.current?.removeImage(attachment.file_url);
      setDirty(true);
    } catch {
      setError('이미지 제거 요청에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      operationRef.current = false;
      setProcessing(false);
    }
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (busy || operationRef.current) return;
    setError('');
    if (!title.trim() || title.length > 500) {
      setError('게시글 제목을 1~500자로 입력해 주세요.');
      return;
    }
    if (editorRef.current?.isEmpty() !== false) {
      setError('게시글 본문을 입력해 주세요.');
      return;
    }
    if (
      articleId &&
      (!/^\d+$/.test(articleId) ||
        Number(articleId) < 1 ||
        Number(articleId) > 100000000)
    ) {
      setError('게시글 ID는 1부터 100000000까지의 정수로 입력해 주세요.');
      return;
    }
    if (!initial && articleId && idCheck.data === true) {
      setError('이미 사용 중인 게시글 ID입니다. 다른 ID를 입력해 주세요.');
      return;
    }
    if (startsOn && endsOn && startsOn > endsOn) {
      setError('행사 시작일은 마감일보다 늦을 수 없습니다.');
      return;
    }
    if ((initial?.starts_on && !startsOn) || (initial?.ends_on && !endsOn)) {
      setError('기존 행사 날짜는 비울 수 없습니다. 날짜를 선택해 주세요.');
      return;
    }
    setPendingPayload({
      ...(initial
        ? {}
        : {
            source_type: sourceType,
            status,
            ...(articleId ? { article_id: Number(articleId) } : {}),
          }),
      title: title.trim(),
      content: editorRef.current!.getHTML(),
      ...(startsOn ? { starts_on: startsOn } : {}),
      ...(endsOn ? { ends_on: endsOn } : {}),
      category_ids: categoryIds,
      vendors: vendors.map((item) => ({
        ...(item.id !== undefined ? { id: item.id } : {}),
        vendor_id: item.vendor_id,
        ...(item.source_url ? { source_url: item.source_url } : {}),
      })),
      attachments: attachments.map((item) => ({
        ...(item.id !== undefined ? { id: item.id } : {}),
        file_url: item.file_url,
        ...(item.original_name !== undefined
          ? { original_name: item.original_name }
          : {}),
        ...(item.content_type !== undefined
          ? { content_type: item.content_type }
          : {}),
        ...(item.size_bytes !== undefined
          ? { size_bytes: item.size_bytes }
          : {}),
      })),
    });
    setDialog('save');
  };
  const handleSave = async () => {
    if (!pendingPayload || operationRef.current) return;
    operationRef.current = true;
    setProcessing(true);
    try {
      await save.mutateAsync(pendingPayload);
      setDirty(false);
      // Saving succeeded: never offer another POST if a subsequent refetch fails.
      const keys = [
        'adminDashboard',
        'adminArticles',
        'adminArticleCounts',
        'adminArticleDetail',
        'adminEditor',
      ];
      if (status === 'PUBLISHED')
        keys.push(
          'monthlyAll',
          'events',
          'eventDetail',
          'hotEvents',
          'bookmarks'
        );
      await Promise.allSettled(
        keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
      );
      navigate('/manage', { replace: true });
    } catch (cause) {
      setError(
        editorErrorMessage(
          cause,
          '게시글을 저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.'
        )
      );
      setDialog(null);
    } finally {
      operationRef.current = false;
      setProcessing(false);
    }
  };
  const availableCategories = (categories.data ?? []).filter(
    (item) => item.is_active || categoryIds.includes(item.id)
  );
  const missingCategories = (initial?.categories ?? []).filter(
    (item) =>
      !availableCategories.some((option) => option.id === item.id) &&
      categoryIds.includes(item.id)
  );
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-700">
      <ManageNavigation onNavigate={handleNavigate} />
      <main className="mx-auto max-w-[924px] px-6 pb-4 pt-8 max-mobile:px-4">
        <form
          id="article-editor"
          onSubmit={handleSubmit}
          onChange={() => setDirty(true)}
        >
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              aria-label="작성 취소하고 돌아가기"
              className="rounded-full border border-gray-200 bg-white p-1.5 shadow-sm"
              onClick={handleCancel}
              disabled={busy}
            >
              <RiArrowLeftSLine size={24} />
            </button>
            <h1 className="text-[22px] font-bold text-black">
              게시글 {initial ? '수정하기' : '추가하기'}
            </h1>
          </div>
          {forbidden && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-amber-200 bg-white p-5 text-sm"
            >
              관리자 접근 권한을 확인해 주세요. 관리자 권한이 부여된 계정으로
              로그인해야 합니다.{' '}
              <Link
                to="/login"
                state={{
                  from: {
                    pathname: initial
                      ? `/manage/edit/${initial.id}`
                      : '/manage/edit',
                  },
                }}
                className="underline"
              >
                다시 로그인
              </Link>
            </div>
          )}
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600"
            >
              {error}
            </p>
          )}
          <fieldset disabled={busy || forbidden} className="min-w-0">
            <section
              aria-label="게시글 정보"
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <h2 className="bg-[#F8F9FA] px-5 py-4 text-xs text-gray-600">
                게시글 정보
              </h2>
              <FieldRow label="게시글 ID">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    aria-label="게시글 ID"
                    inputMode="numeric"
                    value={initial?.id ?? articleId}
                    disabled={!!initial}
                    onChange={(event) => setArticleId(event.target.value)}
                    placeholder="ID를 입력하세요"
                    className={`${INPUT} w-40`}
                  />
                  {!initial && (
                    <button
                      type="button"
                      className={BUTTON}
                      disabled={
                        !/^\d+$/.test(articleId) ||
                        Number(articleId) < 1 ||
                        Number(articleId) > 100000000 ||
                        idCheck.isFetching
                      }
                      onClick={() => void idCheck.refetch()}
                    >
                      중복 확인
                    </button>
                  )}
                </div>
                {!initial && (
                  <p className="mt-2 text-xs text-gray-400">
                    비워 두면 자동으로 발급됩니다. 직접 지정할 경우 최대 1억까지
                    입력할 수 있습니다.
                  </p>
                )}
                {!initial && idCheck.isFetching && (
                  <p role="status" className="mt-2 text-xs">
                    ID 확인 중…
                  </p>
                )}
                {!initial && idCheck.isError && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    ID를 확인하지 못했습니다. 다시 시도해 주세요.
                  </p>
                )}
                {!initial &&
                  !idCheck.isFetching &&
                  !idCheck.isError &&
                  idCheck.data !== undefined && (
                    <p
                      role="status"
                      className={`mt-2 text-xs ${idCheck.data ? 'text-red-600' : 'text-gray-600'}`}
                    >
                      {idCheck.data
                        ? '이미 사용 중인 ID입니다.'
                        : '확인 시점에 사용하지 않는 ID입니다. 최종 등록 시 다시 확인됩니다.'}
                    </p>
                  )}
              </FieldRow>
              <FieldRow label="게시글 제목">
                <div className="flex gap-2 max-mobile:flex-wrap">
                  <input
                    aria-label="게시글 제목"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={500}
                    placeholder="제목을 입력하세요"
                    className={`${INPUT} w-full`}
                  />
                  <button
                    type="button"
                    className={`${BUTTON} shrink-0`}
                    disabled={!title.trim() || duplicates.isFetching}
                    onClick={() => void duplicates.refetch()}
                  >
                    유사 제목 확인
                  </button>
                </div>
                {duplicates.isFetching && (
                  <p role="status" className="mt-2 text-xs">
                    유사 제목 확인 중…
                  </p>
                )}
                {duplicates.isError && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    유사 제목을 확인하지 못했습니다.
                  </p>
                )}
                {duplicates.data &&
                  !duplicates.isFetching &&
                  !duplicates.isError && (
                    <div role="status" className="mt-3 text-xs text-gray-600">
                      <p>
                        {duplicates.data.exists
                          ? '같은 제목을 포함한 게시글입니다. 출처와 내용을 확인해 주세요.'
                          : '같은 제목을 포함한 게시글을 찾지 못했습니다. 등록 가능 여부를 보장하지는 않습니다.'}
                      </p>
                      <ul className="mt-2 space-y-2">
                        {duplicates.data.articles.map((item) => (
                          <li key={item.id}>
                            <Link
                              to={`/manage/detail/${item.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              #{item.id} {item.title}
                            </Link>{' '}
                            · {STATUS_LABELS[item.status]}
                          </li>
                        ))}
                      </ul>
                      {duplicates.data.articles.length === 20 && (
                        <p>
                          최대 20건만 표시됩니다. 제목을 더 구체적으로 입력해
                          주세요.
                        </p>
                      )}
                    </div>
                  )}
              </FieldRow>
              <FieldRow label="카테고리">
                <div className="flex flex-wrap gap-2">
                  {[...availableCategories, ...missingCategories].map(
                    (item) => (
                      <label
                        key={item.id}
                        className={`relative cursor-pointer rounded-full border px-4 py-2 text-xs has-focus-visible:ring-2 has-focus-visible:ring-gray-500 ${categoryIds.includes(item.id) ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600'}`}
                      >
                        <input
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          type="checkbox"
                          checked={categoryIds.includes(item.id)}
                          onChange={() =>
                            setCategoryIds((current) =>
                              current.includes(item.id)
                                ? current.filter((id) => id !== item.id)
                                : [...current, item.id]
                            )
                          }
                        />
                        {item.name}
                        {'is_active' in item && !item.is_active
                          ? ' (숨김)'
                          : ''}
                      </label>
                    )
                  )}
                </div>
                {categories.isPending && (
                  <p className="text-xs">카테고리 불러오는 중…</p>
                )}
                {categories.isError && (
                  <p role="alert" className="text-xs text-red-600">
                    카테고리를 불러오지 못했습니다.{' '}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => void categories.refetch()}
                    >
                      다시 시도
                    </button>
                  </p>
                )}
                {categories.data?.length === 0 && (
                  <p className="text-xs text-gray-500">
                    등록된 카테고리가 없습니다.
                  </p>
                )}
              </FieldRow>
              <FieldRow label="출처">
                <div className="mb-3 flex items-center gap-4 text-xs">
                  <span>공지 유형</span>
                  {(['SCHOOL', 'CLUB'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="source-type"
                        className="accent-black"
                        value={type}
                        checked={sourceType === type}
                        disabled={!!initial || vendors.length > 0}
                        onChange={() => {
                          setSourceType(type);
                          setStatus(
                            type === 'SCHOOL' ? 'PENDING_REVIEW' : 'DRAFT'
                          );
                        }}
                      />
                      {type === 'SCHOOL' ? '학교' : '동아리'}
                    </label>
                  ))}
                </div>
                <ul className="space-y-2">
                  {vendors.map((item, index) => (
                    <li
                      key={item.id ?? `new-${index}`}
                      className="flex min-w-0 items-center gap-2 text-xs"
                    >
                      <span className="shrink-0 rounded-full border border-gray-200 px-3 py-2">
                        {item.vendor_name}
                      </span>
                      <span className="break-all text-gray-500">
                        {item.source_url}
                      </span>
                      {item.external_key !== undefined ? (
                        <span className="shrink-0 text-gray-400">
                          수집 출처
                        </span>
                      ) : (
                        <button
                          type="button"
                          aria-label={`${item.vendor_name} 출처 제거 ${index + 1}`}
                          onClick={() => {
                            setVendors((current) =>
                              current.filter((_, i) => i !== index)
                            );
                            setDirty(true);
                          }}
                        >
                          <RiCloseLine />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-1 inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-2 text-xs text-gray-500"
                  onClick={() => {
                    setVendorId('');
                    setVendorUrl('');
                    setVendorError('');
                    setDialog('vendor');
                  }}
                >
                  <RiAddLine /> 출처 추가
                </button>
                {vendors.length > 0 && !initial && (
                  <p className="mt-2 text-xs text-gray-400">
                    공지 유형을 바꾸려면 선택한 출처를 먼저 제거해 주세요.
                  </p>
                )}
              </FieldRow>
              <FieldRow label="행사 기간">
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <label className="flex items-center gap-2">
                    시작일
                    <input
                      aria-label="행사 시작일"
                      type="date"
                      value={startsOn}
                      onChange={(event) => setStartsOn(event.target.value)}
                      className={`${INPUT} w-40`}
                    />
                  </label>
                  <span>~</span>
                  <label className="flex items-center gap-2">
                    마감일
                    <input
                      aria-label="행사 마감일"
                      type="date"
                      value={endsOn}
                      onChange={(event) => setEndsOn(event.target.value)}
                      className={`${INPUT} w-40`}
                    />
                  </label>
                </div>
              </FieldRow>
              <FieldRow label="상태">
                {initial ? (
                  <p className="py-2 text-sm">
                    {STATUS_LABELS[status]}
                    <span className="ml-3 text-xs text-gray-400">
                      상태 변경은 목록 화면에서 진행해 주세요.
                    </span>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-5 py-2 text-xs">
                    {(sourceType === 'SCHOOL'
                      ? ([
                          'PENDING_REVIEW',
                          'READY_TO_PUBLISH',
                          'PUBLISHED',
                        ] as const)
                      : (['DRAFT', 'PUBLISHED'] as const)
                    ).map((item) => (
                      <label key={item} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          checked={status === item}
                          onChange={() => setStatus(item)}
                          className="accent-black"
                        />
                        {STATUS_LABELS[item]}
                      </label>
                    ))}
                  </div>
                )}
              </FieldRow>
            </section>
            <div className="mt-5">
              <TipTapEditor
                ref={editorRef}
                initialValue={initial?.content ?? ''}
                disabled={busy || forbidden}
                onChange={() => setDirty(true)}
                onUpload={(files) => void handleUpload(files)}
              />
            </div>
            {attachments.length > 0 && (
              <section
                aria-label="첨부 이미지"
                className="mt-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <h2 className="text-sm">첨부 파일 ({attachments.length}/20)</h2>
                <p className="mt-1 text-xs text-gray-500">
                  본문에서 지운 이미지도 첨부로 유지됩니다. 첨부에서도 빼려면
                  제거해 주세요.
                </p>
                <ul className="mt-3 space-y-2">
                  {attachments.map((item, index) => (
                    <li
                      key={item.id ?? item.file_url}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="break-all">
                        {item.original_name ?? `첨부 ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        className="shrink-0 underline"
                        aria-label={`첨부 ${index + 1} 제거`}
                        onClick={() => void handleRemoveAttachment(item)}
                      >
                        제거
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </fieldset>
          {upload.isPending && (
            <p role="status" className="mt-3 text-sm">
              이미지 업로드 중…
            </p>
          )}
          {cleanup.isPending && (
            <p role="status" className="mt-3 text-sm">
              이미지 정리 요청 중…
            </p>
          )}
        </form>
        {dialog === 'vendor' && (
          <EditorDialog title="출처 추가" onCancel={() => setDialog(null)}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const selected = vendorOptions.data?.find(
                  (item) =>
                    item.id === Number(vendorId) &&
                    item.type === sourceType &&
                    item.is_active
                );
                if (!selected) {
                  setVendorError('제공처를 선택해 주세요.');
                  return;
                }
                const url = vendorUrl.trim();
                if (url) {
                  try {
                    if (!['http:', 'https:'].includes(new URL(url).protocol))
                      throw new Error();
                  } catch {
                    setVendorError(
                      '원본 URL은 http 또는 https 주소를 입력해 주세요.'
                    );
                    return;
                  }
                }
                setVendors((current) => [
                  ...current,
                  {
                    vendor_id: selected.id,
                    vendor_name: selected.name,
                    ...(url ? { source_url: url } : {}),
                  },
                ]);
                setDirty(true);
                setDialog(null);
              }}
            >
              <label className="block">
                제공처
                <select
                  aria-label="제공처"
                  autoFocus
                  value={vendorId}
                  onChange={(event) => setVendorId(event.target.value)}
                  className={`${INPUT} mt-2 w-full`}
                >
                  <option value="">제공처 선택</option>
                  {vendorOptions.data
                    ?.filter(
                      (item) => item.type === sourceType && item.is_active
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>
              {vendorOptions.isPending && (
                <p className="mt-2">제공처 불러오는 중…</p>
              )}
              {vendorOptions.isError && (
                <p role="alert" className="mt-2 text-red-600">
                  제공처를 불러오지 못했습니다.{' '}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => void vendorOptions.refetch()}
                  >
                    다시 시도
                  </button>
                </p>
              )}
              {vendorOptions.data?.length === 0 && (
                <p className="mt-2">선택할 수 있는 제공처가 없습니다.</p>
              )}
              <label className="mt-4 block">
                원본 URL (선택)
                <input
                  type="url"
                  maxLength={1000}
                  placeholder="https://"
                  value={vendorUrl}
                  onChange={(event) => setVendorUrl(event.target.value)}
                  className={`${INPUT} mt-2 w-full`}
                />
              </label>
              {vendorError && (
                <p role="alert" className="mt-3 text-red-600">
                  {vendorError}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className={BUTTON}
                  onClick={() => setDialog(null)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!vendorId || vendorOptions.isError}
                  className="rounded-xl bg-black px-5 py-2 text-white disabled:opacity-40"
                >
                  추가
                </button>
              </div>
            </form>
          </EditorDialog>
        )}
        {(dialog === 'save' || dialog === 'cancel') && (
          <EditorDialog
            title={
              dialog === 'save'
                ? `게시글을 ${initial ? '수정' : '등록'}할까요?`
                : '작성을 취소할까요?'
            }
            pending={busy}
            onCancel={() => setDialog(null)}
          >
            <p>
              {dialog === 'cancel'
                ? '작성한 내용은 저장되지 않으며, 새로 업로드한 파일은 정리 요청합니다.'
                : status === 'PUBLISHED'
                  ? '저장하면 사용자에게 게시글이 공개됩니다.'
                  : `${STATUS_LABELS[status]} 상태로 저장됩니다.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                className={BUTTON}
                onClick={() => setDialog(null)}
              >
                계속 작성
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void (dialog === 'save' ? handleSave() : handleDiscard())
                }
                className="rounded-xl bg-black px-5 py-2 text-white disabled:opacity-40"
              >
                {busy ? '처리 중…' : '확인'}
              </button>
            </div>
          </EditorDialog>
        )}
      </main>
      <footer className="mt-1 border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[988px] items-center justify-between px-6 py-4 max-mobile:px-4">
          <button
            type="button"
            onClick={handleCancel}
            className={BUTTON}
            disabled={busy}
          >
            취소
          </button>
          <button
            type="submit"
            form="article-editor"
            disabled={busy || forbidden}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm text-white disabled:opacity-40"
          >
            <RiCheckLine />
            게시글 {initial ? '수정하기' : '등록하기'}
          </button>
        </div>
      </footer>
    </div>
  );
};
export default ArticleEditorSection;
