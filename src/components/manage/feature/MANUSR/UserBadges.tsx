import type { UserRole, UserStatus } from '@/api/manage/users';

export const UserRoleBadge = ({ role }: { role: UserRole }) => (
  <span
    className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] ${role === 'ADMIN' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
  >
    {role === 'ADMIN' ? '관리자' : '사용자'}
  </span>
);
export const UserStatusBadge = ({ status }: { status: UserStatus }) => (
  <span
    className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] ${status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-red-200 bg-red-50 text-red-600'}`}
  >
    {status === 'ACTIVE' ? '활성' : '탈퇴'}
  </span>
);
