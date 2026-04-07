import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import TableList from '../../../components/manage/common/TableList';
import AlertModal from '../../../components/manage/common/AlertModal';
import { patchAdminArticleStatus } from '@/api/manage/adminArticles';

const MANURVPage = () => {
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
          <h2 className="text-lg font-bold text-gray-800 mb-2">미검수 게시글</h2>

          {/* 중복 의심 게시글 */}
          <TableList
            status="SUSPECTED_DUPLICATE"
            title="중복 의심 게시글"
            actions={[
              {
                label: '반영대기',
                color: 'text-main-component',
                onClick: (ids) => handleAction(
                  '반영 대기 상태로 변경하시겠습니까?',
                  () => patchAdminArticleStatus(ids, 'REFLECTION_WAITING'),
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

          {/* 신규 크롤링 게시글 */}
          <TableList
            status="INSPECTED_YET"
            title="신규 크롤링 게시글"
            actions={[
              {
                label: '반영대기',
                color: 'text-main-component',
                onClick: (ids) => handleAction(
                  '반영 대기 상태로 변경하시겠습니까?',
                  () => patchAdminArticleStatus(ids, 'REFLECTION_WAITING'),
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

export default MANURVPage;
