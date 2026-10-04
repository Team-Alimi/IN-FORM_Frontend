import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RiCloseLine, RiLockLine } from 'react-icons/ri';
import {
  createAdminVendor,
  updateAdminVendor,
  getClubTypes,
} from '@/api/manage/vendors';
import type { AdminVendor } from '@/api/manage/vendors';
import {
  buildVendorPatch,
  hasClubTypesChanged,
  getVendorWarning,
  validateVendorForm,
} from '@/utils/manage/vendorForm';
import type { VendorFormValues } from '@/utils/manage/vendorForm';
import { isDashboardForbidden } from '@/api/manage/dashboard';

const INPUT =
  'mt-1 w-full rounded-lg border border-gray-100 bg-[#F7F8FA] px-3 py-2.5 text-xs text-gray-800 placeholder:text-gray-300';
const VendorEditorModal = ({
  original,
  onClose,
  onSaved,
}: {
  original: AdminVendor | null;
  onClose: () => void;
  onSaved: (vendor: AdminVendor) => void;
}) => {
  const ref = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<VendorFormValues>({
    name: original?.name ?? '',
    initial: original?.initial ?? '',
    type: original?.type ?? 'SCHOOL',
    homepage_url: original?.homepage_url ?? '',
    is_active: original?.is_active ?? true,
    club_type_ids: original?.club_types?.map((item) => item.id) ?? [],
  });
  const clubTypes = useQuery({
    queryKey: ['clubTypes'],
    queryFn: getClubTypes,
    enabled: form.type === 'CLUB',
  });
  const typesChanged = !original || hasClubTypesChanged(form, original);
  const existingOnlyTypes = (original?.club_types ?? []).filter(
    (item) => !(clubTypes.data ?? []).some((option) => option.id === item.id)
  );
  const unavailableTypes = clubTypes.isSuccess ? existingOnlyTypes : [];
  const [error, setError] = useState('');
  const [missing, setMissing] = useState(false);
  const [saved, setSaved] = useState<AdminVendor | null>(null);
  const warning = getVendorWarning(saved);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, []);
  const mutation = useMutation({
    mutationFn: (values: VendorFormValues) =>
      original
        ? updateAdminVendor(original.id, buildVendorPatch(values, original))
        : createAdminVendor({
            name: values.name.trim(),
            initial: values.initial.trim(),
            type: values.type,
            ...(values.type === 'CLUB'
              ? { club_type_ids: values.club_type_ids }
              : {}),
            ...(values.homepage_url.trim()
              ? { homepage_url: values.homepage_url.trim() }
              : {}),
          }),
    onSuccess: async (vendor) => {
      setSaved(vendor);
      setError('');
      onSaved(vendor);
      await Promise.all(
        [
          ['adminVendors'],
          ['adminDashboard'],
          ['adminEditor'],
          ['adminArticleDetail'],
          ['adminArticles'],
          ['vendors'],
          ['myVendors'],
          ['clubs'],
          ['monthlyAll'],
          ['events'],
          ['eventDetail'],
          ['hotEvents'],
          ['bookmarks'],
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: (cause) => {
      const serverError = isAxiosError(cause)
        ? cause.response?.data?.error
        : undefined;
      setError(
        typeof serverError?.message === 'string'
          ? serverError.message
          : '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
      if (isAxiosError(cause) && cause.response?.status === 404) {
        setMissing(true);
        void queryClient.invalidateQueries({ queryKey: ['adminVendors'] });
      }
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  const forbidden = isDashboardForbidden(mutation.error);
  const unchanged =
    original !== null &&
    Object.keys(buildVendorPatch(form, original)).length === 0;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || saved || forbidden || missing || unchanged)
      return;
    const validation = validateVendorForm(form, original);
    if (validation) {
      setError(validation);
      return;
    }
    if (form.type === 'CLUB' && typesChanged) {
      if (!clubTypes.isSuccess || clubTypes.isError) {
        setError('동아리 유형 목록을 불러온 뒤 다시 저장해 주세요.');
        return;
      }
      if (
        form.club_type_ids.some(
          (id) => !clubTypes.data.some((item) => item.id === id)
        )
      ) {
        setError(
          '유형을 변경하려면 비활성 유형을 해제하고 선택 가능한 유형으로 바꿔 주세요.'
        );
        return;
      }
    }
    setError('');
    submitting.current = true;
    mutation.mutate(form);
  };
  const handleClose = () => {
    if (!submitting.current) onClose();
  };
  return (
    <dialog
      ref={ref}
      aria-labelledby="vendor-editor-title"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_32px)] max-w-[480px] overflow-y-auto rounded-[20px] bg-white text-sm text-gray-800 shadow-xl backdrop:bg-black/25 backdrop:backdrop-blur-[2px]"
    >
      <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <h2 id="vendor-editor-title" className="text-base font-bold text-black">
          {original ? '제공처 정보 수정' : '제공처 / 동아리 등록'}
        </h2>
        <button
          aria-label="제공처 창 닫기"
          onClick={handleClose}
          disabled={mutation.isPending}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-40"
        >
          <RiCloseLine size={20} />
        </button>
      </header>
      {saved ? (
        <div className="space-y-4 p-6">
          <div role="status">
            <p className="font-semibold">
              {original ? '변경사항을 저장했습니다.' : '제공처를 등록했습니다.'}
            </p>
            <p className="mt-2 break-words text-xs text-gray-500">
              #{saved.id} · {saved.name} · 식별자: {saved.initial}
            </p>
            {warning && (
              <p className="mt-4 break-words rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {warning}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-black py-3 text-xs font-semibold text-white disabled:opacity-40"
          >
            {mutation.isPending ? '목록 갱신 중…' : '확인'}
          </button>
        </div>
      ) : (
        <form
          aria-label={original ? '제공처 수정' : '제공처 등록'}
          onSubmit={handleSubmit}
          noValidate
          className="p-6"
        >
          <fieldset
            disabled={mutation.isPending || forbidden || missing}
            className="space-y-6 disabled:opacity-60"
          >
            {original && (
              <>
                <label className="block text-xs font-medium">
                  식별자 (initial)
                  <div className="relative">
                    <RiLockLine
                      aria-hidden="true"
                      className="absolute left-3 top-4 text-gray-400"
                    />
                    <input
                      aria-label="식별자 (initial)"
                      readOnly
                      value={original.initial}
                      className={`${INPUT} pl-9 font-mono text-gray-400`}
                    />
                  </div>
                  <span className="mt-2 block font-normal text-gray-400">
                    고유 식별자는 수정할 수 없습니다.
                  </span>
                </label>
                <div className="text-xs text-gray-400">
                  유형 (type) — 수정 불가
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-100 px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] ${original.type === 'SCHOOL' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}
                    >
                      {original.type}
                    </span>
                    {original.type === 'SCHOOL' ? '학과/기관' : '동아리'}
                  </div>
                </div>
              </>
            )}
            <label className="block text-xs font-medium">
              제공처 이름 {!original && <span className="text-red-500">*</span>}
              <input
                aria-label="제공처 이름"
                required
                maxLength={100}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="예: 컴퓨터공학과, 중앙동아리 인하밴드"
                className={INPUT}
              />
            </label>
            {!original && (
              <>
                <label className="block text-xs font-medium">
                  식별자 (initial) <span className="text-red-500">*</span>
                  <input
                    aria-label="식별자 (initial)"
                    required
                    maxLength={100}
                    value={form.initial}
                    onChange={(event) =>
                      setForm({ ...form, initial: event.target.value })
                    }
                    placeholder="예: cse_inha, club_inhaband"
                    className={INPUT}
                  />
                  <span className="mt-2 block font-normal text-gray-400">
                    공백 없이 입력해 주세요. 등록 후에는 변경할 수 없습니다.
                  </span>
                </label>
                <fieldset className="text-xs">
                  <legend className="mb-2 font-medium">
                    유형 (type) <span className="text-red-500">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-4">
                    {(['SCHOOL', 'CLUB'] as const).map((value) => (
                      <label key={value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="vendor-type"
                          checked={form.type === value}
                          onChange={() => setForm({ ...form, type: value })}
                          className="accent-black"
                        />
                        {value} ({value === 'SCHOOL' ? '학과/기관' : '동아리'})
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {form.type === 'CLUB' && (
              <fieldset className="text-xs">
                <legend className="mb-2 font-medium">
                  동아리 유형 (복수 선택){' '}
                  <span className="text-red-500">*</span>
                </legend>
                {clubTypes.isPending && (
                  <p role="status">동아리 유형 불러오는 중…</p>
                )}
                {clubTypes.isError && (
                  <p role="alert" className="text-red-600">
                    동아리 유형을 불러오지 못했습니다.{' '}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => void clubTypes.refetch()}
                    >
                      다시 시도
                    </button>
                  </p>
                )}
                {clubTypes.isSuccess && clubTypes.data.length === 0 && (
                  <p>선택 가능한 동아리 유형이 없습니다.</p>
                )}
                <div className="flex flex-wrap gap-3">
                  {[...(clubTypes.data ?? []), ...existingOnlyTypes].map(
                    (item) => (
                      <label key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={!clubTypes.isSuccess}
                          checked={form.club_type_ids.includes(item.id)}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              club_type_ids: event.target.checked
                                ? [...current.club_type_ids, item.id]
                                : current.club_type_ids.filter(
                                    (id) => id !== item.id
                                  ),
                            }))
                          }
                          className="accent-black"
                        />
                        {item.name}
                        {unavailableTypes.some(
                          (option) => option.id === item.id
                        ) && ' (비활성)'}
                      </label>
                    )
                  )}
                </div>
                {unavailableTypes.length > 0 && (
                  <p className="mt-2 text-gray-500">
                    기존 비활성 유형은 그대로 유지할 수 있습니다. 유형을 변경할
                    때는 비활성 유형을 해제해 주세요.
                  </p>
                )}
              </fieldset>
            )}
            <label className="block text-xs font-medium">
              홈페이지 URL{' '}
              {!original && (
                <span className="font-normal text-gray-400">(선택)</span>
              )}
              <input
                aria-label="홈페이지 URL"
                type="url"
                maxLength={500}
                value={form.homepage_url}
                onChange={(event) =>
                  setForm({ ...form, homepage_url: event.target.value })
                }
                placeholder="https://..."
                className={INPUT}
              />
            </label>
            {original && (
              <fieldset aria-label="활성 여부 설정" className="text-xs">
                <legend className="mb-2 font-medium">활성 여부 설정</legend>
                <div className="inline-flex overflow-hidden rounded-lg border border-gray-100">
                  {[
                    { value: true, label: '활성화 (Active)' },
                    { value: false, label: '숨김 (비활성화)' },
                  ].map(({ value, label }) => (
                    <label key={String(value)} className="cursor-pointer">
                      <input
                        type="radio"
                        name="vendor-active"
                        checked={form.is_active === value}
                        onChange={() => setForm({ ...form, is_active: value })}
                        className="peer sr-only"
                      />
                      <span className="block bg-[#F7F8FA] px-5 py-2.5 peer-checked:bg-emerald-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-blue-500">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-gray-400">
                  {form.type === 'CLUB'
                    ? '숨김은 목록·필터 노출만 가립니다.'
                    : '숨김은 목록·필터 노출만 가립니다. 수집은 중단되지 않습니다.'}
                </p>
              </fieldset>
            )}
          </fieldset>
          {error && (
            <p role="alert" className="mt-4 text-xs text-red-600">
              {error}
            </p>
          )}
          {forbidden && (
            <Link
              to="/login"
              state={{ from: { pathname: '/manage/vendors' } }}
              className="mt-3 inline-block text-xs underline"
            >
              관리자 계정으로 다시 로그인
            </Link>
          )}
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="w-24 rounded-xl border border-gray-200 py-3 text-xs disabled:opacity-40"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || forbidden || missing || unchanged}
              className="flex-1 rounded-xl bg-black py-3 text-xs font-semibold text-white disabled:opacity-40"
            >
              {mutation.isPending
                ? '저장 중…'
                : original
                  ? '변경사항 저장'
                  : '등록하기'}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
};
export default VendorEditorModal;
