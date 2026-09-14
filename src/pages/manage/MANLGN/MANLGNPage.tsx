import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';

const MANLGNPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6">
          <h1 style={{ color: '#4068f7' }}>MANLGN 페이지</h1>
          <p>✅ MANLGNPage 정상 렌더링</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>manage/MANLGN/MANLGNPage.tsx</p>
        </main>
      </div>
    </div>
  );
};

export default MANLGNPage;
