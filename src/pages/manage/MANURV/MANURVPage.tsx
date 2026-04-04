import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import TableList from '../../../components/manage/common/TableList';
import { patchAdminArticleStatus } from '@/api/manage/adminArticles';

const MANURVPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 mb-2">미검수 게시글</h2>

          {/* 중복 의심 게시글 */}
          <TableList
            status="SUSPECTED_DUPLICATE"
            title="중복 의심 게시글"
            actions={[
              { label: '반영대기', color: 'text-main-component', onClick: (ids) => patchAdminArticleStatus(ids, 'REFLECTION_WAITING') },
              { label: '삭제', color: 'text-red-400', onClick: (ids) => patchAdminArticleStatus(ids, 'GARBAGE') },
            ]}
          />

          {/* 신규 크롤링 게시글 */}
          <TableList
            status="INSPECTED_YET"
            title="신규 크롤링 게시글"
            actions={[
              { label: '반영대기', color: 'text-main-component', onClick: (ids) => patchAdminArticleStatus(ids, 'REFLECTION_WAITING') },
              { label: '삭제', color: 'text-red-400', onClick: (ids) => patchAdminArticleStatus(ids, 'GARBAGE') },
            ]}
          />
        </main>
      </div>
    </div>
  );
};

export default MANURVPage;
