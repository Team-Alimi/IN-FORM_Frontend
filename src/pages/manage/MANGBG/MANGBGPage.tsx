import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import TableList from '../../../components/manage/common/TableList';
import { patchRestoreArticles, deleteArticles } from '@/api/manage/adminArticles';

const MANGBGPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 mb-2">휴지통</h2>

          {/* 미검수 상태에서 휴지통으로 이동된 게시글 */}
          <TableList
            status="GARBAGE"
            title="미검수 게시글"
            previousStatusFilter="INSPECTED_YET"
            actions={[
              { label: '복구', color: 'text-main-component', onClick: (ids) => patchRestoreArticles(ids) },
              { label: '삭제', color: 'text-red-400', onClick: (ids) => deleteArticles(ids) },
            ]}
          />

          {/* 반영대기 상태에서 휴지통으로 이동된 게시글 */}
          <TableList
            status="GARBAGE"
            title="반영 대기 게시글"
            previousStatusFilter="REFLECTION_WAITING"
            actions={[
              { label: '복구', color: 'text-main-component', onClick: (ids) => patchRestoreArticles(ids) },
              { label: '삭제', color: 'text-red-400', onClick: (ids) => deleteArticles(ids) },
            ]}
          />
        </main>
      </div>
    </div>
  );
};

export default MANGBGPage;
