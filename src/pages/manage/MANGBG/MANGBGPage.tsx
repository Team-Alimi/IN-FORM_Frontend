import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import TableList from '../../../components/manage/common/TableList';
import AlertModal from '../../../components/manage/common/AlertModal';
import { patchRestoreArticles, deleteArticles } from '@/api/manage/adminArticles';

const MANGBGPage = () => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ title: string; action: () => Promise<unknown> } | null>(null);

  const handleAction = (title: string, action: () => Promise<unknown>) => {
    setModal({ title, action });
  };

  const handleConfirm = async () => {
    if (!modal) return;
    await modal.action();
    queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
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
          <h2 className="text-lg font-bold text-gray-800 mb-2">휴지통</h2>

          {/* 미검수 상태에서 휴지통으로 이동된 게시글 */}
          <TableList
            status="GARBAGE"
            title="미검수 게시글"
            previousStatusFilter="INSPECTED_YET"
            actions={[
              {
                label: '복구',
                color: 'text-main-component',
                onClick: (ids) => handleAction(
                  '게시글을 복구하시겠습니까? 삭제 전 상태로 되돌립니다.',
                  () => patchRestoreArticles(ids),
                ),
              },
              {
                label: '영구 삭제',
                color: 'text-red-400',
                onClick: (ids) => handleAction(
                  '해당 게시글을 영구히 삭제할까요?',
                  () => deleteArticles(ids),
                ),
              },
            ]}
          />

          {/* 반영대기 상태에서 휴지통으로 이동된 게시글 */}
          <TableList
            status="GARBAGE"
            title="반영 대기 게시글"
            previousStatusFilter="REFLECTION_WAITING"
            actions={[
              {
                label: '복구',
                color: 'text-main-component',
                onClick: (ids) => handleAction(
                  '게시글을 복구하시겠습니까? 삭제 전 상태로 되돌립니다.',
                  () => patchRestoreArticles(ids),
                ),
              },
              {
                label: '영구 삭제',
                color: 'text-red-400',
                onClick: (ids) => handleAction(
                  '해당 게시글을 영구히 삭제할까요?',
                  () => deleteArticles(ids),
                ),
              },
            ]}
          />
        </main>
      </div>
    </div>
  );
};

export default MANGBGPage;
