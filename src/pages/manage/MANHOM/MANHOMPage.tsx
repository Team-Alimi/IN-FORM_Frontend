import { useQuery } from '@tanstack/react-query';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import DashBoardCard from '../../../components/manage/feature/MANHOM/DashBoardCard';
import { RiEyeOffLine, RiTimeLine, RiFileCopyLine } from 'react-icons/ri';

const MANHOMPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="flex gap-4">
            <DashBoardCard icon={RiEyeOffLine} count={0} label="미검수 게시글 개수" />
            <DashBoardCard icon={RiTimeLine} count={0} label="반영대기 게시글" />
            <DashBoardCard icon={RiFileCopyLine} count={0} label="중복 의심 콘텐츠" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MANHOMPage;
