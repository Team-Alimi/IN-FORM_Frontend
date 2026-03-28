import { useNavigate, useLocation } from 'react-router-dom';
import { RiHome4Line, RiEyeOffLine, RiTimeLine, RiDeleteBin6Line, RiPencilLine } from 'react-icons/ri';
import MenuBtn from './MenuBtn';

const Menu = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="flex flex-col justify-between h-full w-52 bg-[#F9FAFB] px-4 py-6">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/manage/edit')}
          className="flex items-center justify-between w-full bg-[#005CBE] text-white text-sm font-medium px-6 py-3 rounded-xl transition-all hover:bg-[#0047A3] active:scale-99 active:brightness-90"
        >
          새 게시글 생성하기
          <RiPencilLine size={17} />
        </button>

        <div className="flex flex-col gap-1">
          <MenuBtn icon={RiHome4Line} label="홈" active={pathname === '/manage'} onClick={() => navigate('/manage')} />
          <MenuBtn icon={RiEyeOffLine} label="미검수 게시글" active={pathname === '/manage/unreviewed'} onClick={() => navigate('/manage/unreviewed')} />
          <MenuBtn icon={RiTimeLine} label="반영대기" active={pathname === '/manage/staged'} onClick={() => navigate('/manage/staged')} />
        </div>
      </div>

      <MenuBtn icon={RiDeleteBin6Line} label="휴지통" variant="danger" active={pathname === '/manage/garbage'} onClick={() => navigate('/manage/garbage')} />
    </nav>
  );
};

export default Menu;
