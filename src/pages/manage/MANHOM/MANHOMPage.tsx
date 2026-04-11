import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import DashBoardCard from '../../../components/manage/feature/MANHOM/DashBoardCard';
import TableList from '../../../components/manage/common/TableList';
import AlertModal from '../../../components/manage/common/AlertModal';
import { RiEyeOffLine, RiTimeLine, RiFileCopyLine } from 'react-icons/ri';
import { getAdminArticleCounts, postDeployArticles, patchAdminArticleStatus } from '../../../api/manage/adminArticles';

const MANHOMPage = () => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ title: string; action: () => Promise<unknown> } | null>(null);

  const { data } = useQuery({
    queryKey: ['adminArticleCounts'],
    queryFn: getAdminArticleCounts,
  });

  const handleAction = (title: string, action: () => Promise<unknown>) => {
    setModal({ title, action });
  };

  const handleConfirm = async () => {
    if (!modal) return;
    await modal.action();
    queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
    queryClient.invalidateQueries({ queryKey: ['adminArticleCounts'] });
    setModal(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {modal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
              <AlertModal
                title={modal.title}
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
              />
            </div>
          )}
          <div className="flex gap-4">
            <DashBoardCard icon={RiEyeOffLine} count={data?.inspected_yet ?? 0} label="미검수 게시글 개수" />
            <DashBoardCard icon={RiTimeLine} count={data?.reflection_waiting ?? 0} label="반영대기 게시글" />
            <DashBoardCard icon={RiFileCopyLine} count={data?.suspected_duplicate ?? 0} label="중복 의심 콘텐츠" />
          </div>
          <TableList
            status="REFLECTION_WAITING"
            title="반영대기 게시글"
            actions={[
              {
                label: '반영',
                color: 'text-main-component',
                onClick: (ids) => handleAction(
                  '실제 운영 데이터가 변경됩니다. 진행하시겠습니까?',
                  () => postDeployArticles(ids),
                ),
              },
              {
                label: '삭제',
                color: 'text-red-400',
                onClick: (ids) => handleAction(
                  '해당 게시글을 삭제하시겠습니까?',
                  () => patchAdminArticleStatus(ids, 'GARBAGE'),
                ),
              },
            ]}
          />
        </main>
      </div>
    </div>
  );
};

export default MANHOMPage;
