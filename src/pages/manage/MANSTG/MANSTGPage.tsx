import TableList from '@/components/manage/common/TableList';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';

const MANSTGPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
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

export default MANSTGPage;
