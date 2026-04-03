import { useParams } from 'react-router-dom';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import ArticleEditorSection from '@/components/manage/feature/MANDTE/ArticleEditorSection';

const MANDTEPage = () => {
  const { id } = useParams<{ id?: string }>();
  const articleId = id ? Number(id) : undefined;

  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6">
          <ArticleEditorSection articleId={articleId} />
        </main>
      </div>
    </div>
  );
};

export default MANDTEPage;
