import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RiDeleteBinLine, RiAccountCircleFill } from 'react-icons/ri';
import logo from '@/assets/icons/logo.svg';
import useAuthStore from '@/stores/useAuthStore';

const ManageNavigation = () => {
  const userInfo = useAuthStore((state) => state.userInfo);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate('/login', {
      replace: true,
      state: { from: { pathname: location.pathname } },
    });
  };
  return (
    <header className="flex min-h-16 flex-wrap items-center gap-8 border-b border-gray-100 bg-white px-6 text-xs max-mobile:gap-4 max-mobile:px-4">
      <NavLink
        to="/manage"
        className="flex items-center gap-2 font-bold text-black"
      >
        <img src={logo} alt="" className="h-9 w-6 object-contain" />
        INFORM ADMIN
      </NavLink>
      <nav
        aria-label="관리자 메뉴"
        className="flex self-stretch gap-8 max-mobile:order-3 max-mobile:w-full"
      >
        {[
          ['/manage', '홈'],
          ['/manage/unreviewed', '미검수 게시글'],
          ['/manage/staged', '반영 대기'],
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to!}
            end
            className={({ isActive }) =>
              `flex items-center border-b-2 py-5 ${isActive ? 'border-black font-bold text-black' : 'border-transparent text-gray-500'}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-4 text-gray-500">
        <NavLink to="/manage/garbage" className="flex items-center gap-1">
          <RiDeleteBinLine />
          휴지통
        </NavLink>
        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-gray-700 max-mobile:hidden">
          <RiAccountCircleFill size={21} />
          {userInfo?.name ?? '관리자'}
        </span>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </header>
  );
};
export default ManageNavigation;
