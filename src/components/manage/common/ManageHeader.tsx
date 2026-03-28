import useAuthStore from '../../../stores/useAuthStore';

const ManageHeader = () => {
  const userInfo = useAuthStore((state) => state.userInfo);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <span className="font-bold text-base tracking-tight">INFORM _ 관리자모드</span>
      <span className="text-sm text-gray-700">{userInfo?.name ?? '관리자'}</span>
    </header>
  );
};

export default ManageHeader;
