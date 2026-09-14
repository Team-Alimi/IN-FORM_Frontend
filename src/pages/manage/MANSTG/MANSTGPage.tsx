import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import TableList from '@/components/manage/common/TableList';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import AlertModal from '../../../components/manage/common/AlertModal';
import { postDeployArticles, patchAdminArticleStatus } from '@/api/manage/adminArticles';

const MANSTGPage = () => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ title: string; action: () => Promise<unknown> } | null>(null);

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

export default MANSTGPage;
