import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RiCloseLine, RiCheckLine } from 'react-icons/ri';
import { changeAdminUserRole, getAdminUser } from '@/api/manage/users';
import type { UserRole } from '@/api/manage/users';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import useAuthStore from '@/stores/useAuthStore';
import {
  UserRoleBadge,
  UserStatusBadge,
} from '@/components/manage/feature/MANUSR/UserBadges';
import { formatUserDate } from '@/utils/manage/userPresentation';

const UserDetailPanel = ({
  userId,
  onClose,
}: {
  userId: number;
  onClose: () => void;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const currentUserId = useAuthStore((state) => state.userInfo?.user_id);
  const [confirmRole, setConfirmRole] = useState<UserRole | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ownRoleBlocked, setOwnRoleBlocked] = useState(false);
  const queryClient = useQueryClient();
  const detail = useQuery({
    queryKey: ['adminUsers', 'detail', userId],
    queryFn: ({ signal }) => getAdminUser(userId, signal),
    retry: shouldRetryDashboardQuery,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);
  const mutation = useMutation({
    mutationFn: (role: UserRole) => changeAdminUserRole(userId, role),
    onSuccess: async (user) => {
      await queryClient.cancelQueries({
        queryKey: ['adminUsers', 'detail', userId],
      });
      queryClient.setQueryData(['adminUsers', 'detail', userId], user);
      setConfirmRole(null);
      setMessage(
        `현재 권한이 ${user.role === 'ADMIN' ? '관리자' : '사용자'}로 반영되었습니다.`
      );
      setError('');
      // 역할 필터의 포함 여부·전체 건수·페이지 수까지 서버 기준으로 다시 조회합니다.
      await queryClient.invalidateQueries({ queryKey: ['adminUsers', 'list'] });
    },
    onError: async (cause) => {
      setConfirmRole(null);
      const payload = isAxiosError(cause)
        ? cause.response?.data?.error
        : undefined;
      setError(
        typeof payload?.message === 'string'
          ? payload.message
          : '권한을 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
      if (payload?.code === 'CANNOT_CHANGE_OWN_ROLE') setOwnRoleBlocked(true);
      if (
        isAxiosError(cause) &&
        [400, 404, 409].includes(cause.response?.status ?? 0)
      ) {
        await Promise.all([
          detail.refetch(),
          queryClient.invalidateQueries({ queryKey: ['adminUsers', 'list'] }),
        ]);
        if (cause.response?.status === 409)
          setError(
            '다른 사용자가 회원 정보를 변경했습니다. 최신 정보를 다시 불러왔으니 확인 후 다시 시도해 주세요.'
          );
      }
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  const user = detail.data;
  const isSelf =
    ownRoleBlocked ||
    (currentUserId != null && String(currentUserId) === String(userId));
  const withdrawnUser = user?.status === 'WITHDRAWN' && user.role === 'USER';
  const forbidden =
    isDashboardForbidden(detail.error) || isDashboardForbidden(mutation.error);
  const canChange =
    !!user &&
    !isSelf &&
    !withdrawnUser &&
    !detail.isError &&
    !detail.isFetching &&
    !mutation.isPending &&
    !forbidden;
  const handleConfirm = () => {
    if (
      !confirmRole ||
      !canChange ||
      submitting.current ||
      confirmRole === user?.role
    )
      return;
    submitting.current = true;
    mutation.mutate(confirmRole);
  };
  const handleClose = () => {
    if (!submitting.current) onClose();
  };
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="user-detail-title"
      onCancel={(event) => {
        event.preventDefault();
        if (submitting.current) return;
        if (confirmRole) setConfirmRole(null);
        else onClose();
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-[480px] max-w-full overflow-y-auto bg-white text-sm text-gray-800 shadow-xl backdrop:bg-black/25 backdrop:backdrop-blur-[2px]"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
        <h2 id="user-detail-title" className="font-bold text-black">
          회원 상세 정보
        </h2>
        <button
          aria-label="회원 상세 닫기"
          disabled={mutation.isPending}
          onClick={handleClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-40"
        >
          <RiCloseLine size={20} />
        </button>
      </header>
      <div className="p-6">
        {forbidden ? (
          <div role="alert">
            <p>
              회원 정보를 조회하거나 변경할 권한이 없습니다. 관리자 계정으로
              다시 로그인해 주세요.
            </p>
            <Link
              to="/login"
              state={{ from: { pathname: '/manage/users' } }}
              className="mt-4 inline-block underline"
            >
              다시 로그인
            </Link>
          </div>
        ) : detail.isPending ? (
          <p role="status">회원 정보를 불러오는 중입니다.</p>
        ) : detail.isError ? (
          <div role="alert">
            <p>
              {isAxiosError(detail.error) &&
              detail.error.response?.status === 404
                ? '존재하지 않는 회원입니다.'
                : '회원 정보를 불러오지 못했습니다.'}
            </p>
            <button
              onClick={() => void detail.refetch()}
              className="mt-3 underline"
            >
              다시 시도
            </button>
          </div>
        ) : (
          user && (
            <>
              <div className="mb-5 flex items-center gap-4 border-b border-gray-100 pb-5">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-600"
                >
                  {user.name?.slice(0, 1) || '?'}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-bold text-black">
                    {user.name || '이름 없음'}
                  </h3>
                  <p className="mt-1 break-all text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
                <UserStatusBadge status={user.status} />
              </div>
              <dl className="rounded-2xl bg-[#F7F8FA] px-4 text-xs">
                {[
                  ['회원 고유 ID', user.id],
                  ['이메일', user.email],
                  ['이름', user.name || '—'],
                  [
                    '현재 상태',
                    <UserStatusBadge key="status" status={user.status} />,
                  ],
                  [
                    '온보딩 완료 여부',
                    <span
                      key="onboarding"
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] ${user.onboarding_completed ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-500'}`}
                    >
                      {user.onboarding_completed && (
                        <RiCheckLine aria-hidden="true" />
                      )}
                      {user.onboarding_completed ? '완료' : '미완료'}
                    </span>,
                  ],
                  ['가입 일시', formatUserDate(user.created_at, true)],
                  ['탈퇴 일시', formatUserDate(user.withdrawn_at, true)],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="grid grid-cols-[128px_minmax(0,1fr)] items-center gap-3 border-b border-gray-100 py-4 last:border-0 max-mobile:grid-cols-[104px_minmax(0,1fr)]"
                  >
                    <dt className="text-gray-400">{label}</dt>
                    <dd className="break-words">{value}</dd>
                  </div>
                ))}
              </dl>
              <section
                aria-label="권한 설정"
                className="mt-5 overflow-hidden rounded-2xl border border-gray-200"
              >
                <h3 className="border-b border-gray-100 bg-[#F7F8FA] px-5 py-4 text-xs font-medium text-gray-600">
                  권한 설정
                </h3>
                <div className="p-5 text-xs">
                  <p className="text-gray-500">
                    회원의 역할을 승격하거나 강등할 수 있습니다.
                  </p>
                  <p className="my-4 flex items-center gap-3">
                    현재 권한: <UserRoleBadge role={user.role} />
                  </p>
                  {isSelf && (
                    <p className="mb-3 text-gray-500">
                      자신의 권한은 변경할 수 없습니다.
                    </p>
                  )}
                  {withdrawnUser && (
                    <p className="mb-3 text-gray-500">
                      탈퇴한 회원은 관리자로 승격할 수 없습니다.
                    </p>
                  )}
                  {confirmRole ? (
                    <div
                      role="group"
                      aria-label="권한 변경 확인"
                      className="rounded-lg border border-gray-200 p-3"
                    >
                      <p className="break-words font-semibold">
                        {user.name || user.email} 회원을{' '}
                        {confirmRole === 'ADMIN'
                          ? '관리자로 승격'
                          : '사용자로 변경'}
                        하시겠습니까?
                      </p>
                      <p className="mt-2 text-gray-500">
                        {confirmRole === 'ADMIN'
                          ? '관리자 페이지 접근 및 관리 권한이 부여됩니다.'
                          : '관리자 페이지 접근 및 관리 권한을 잃게 됩니다.'}
                      </p>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          disabled={mutation.isPending}
                          onClick={() => setConfirmRole(null)}
                          className="rounded-lg border border-gray-200 px-4 py-2 disabled:opacity-40"
                        >
                          취소
                        </button>
                        <button
                          disabled={!canChange || confirmRole === user.role}
                          onClick={handleConfirm}
                          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-40"
                        >
                          {mutation.isPending ? '변경 중…' : '확인'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled={!canChange}
                      onClick={() => {
                        setMessage('');
                        setError('');
                        setConfirmRole(user.role === 'USER' ? 'ADMIN' : 'USER');
                      }}
                      className="w-full rounded-lg bg-black py-3 font-semibold text-white disabled:opacity-40"
                    >
                      {user.role === 'USER' ? '관리자로 승격' : '사용자로 변경'}
                    </button>
                  )}
                  {message && (
                    <p role="status" className="mt-3 text-emerald-700">
                      {message}
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="mt-3 text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              </section>
            </>
          )
        )}
      </div>
    </dialog>
  );
};
export default UserDetailPanel;
