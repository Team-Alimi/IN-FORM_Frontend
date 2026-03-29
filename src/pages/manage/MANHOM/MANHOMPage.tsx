import { useQuery } from '@tanstack/react-query';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import DashBoardCard from '../../../components/manage/feature/MANHOM/DashBoardCard';
import TableList from '../../../components/manage/common/TableList';
import { RiEyeOffLine, RiTimeLine, RiFileCopyLine } from 'react-icons/ri';
import { getAdminArticleCounts } from '../../../api/manage/adminArticles';

const MANHOMPage = () => {
  const { data } = useQuery({
    queryKey: ['adminArticleCounts'],
    queryFn: getAdminArticleCounts,
  });

  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="flex gap-4">
            <DashBoardCard icon={RiEyeOffLine} count={data?.inspected_yet ?? 0} label="미검수 게시글 개수" />
            <DashBoardCard icon={RiTimeLine} count={data?.reflection_waiting ?? 0} label="반영대기 게시글" />
            <DashBoardCard icon={RiFileCopyLine} count={data?.suspected_duplicate ?? 0} label="중복 의심 콘텐츠" />
          </div>
          <TableList
            status="REFLECTION_WAITING"
            title="반영대기 게시글"
            actions={[
              { label: '반영', color: 'text-main-component', onClick: (ids) => console.log('반영', ids) },
              { label: '삭제', color: 'text-red-400', onClick: (ids) => console.log('삭제', ids) },
            ]}
          />
        </main>
      </div>
    </div>
  );
};

export default MANHOMPage;
