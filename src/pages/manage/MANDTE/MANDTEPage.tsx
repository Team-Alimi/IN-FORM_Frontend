import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ManageNavigation from '@/components/manage/common/ManageNavigation';
import { getEditorArticle } from '@/api/manage/articleEditor';
import {
  isDashboardForbidden,
  shouldRetryDashboardQuery,
} from '@/api/manage/dashboard';
import ArticleEditorSection from '@/components/manage/feature/MANDTE/ArticleEditorSection';

const MANDTEPage = () => {
  const { id } = useParams<{ id?: string }>();
  const articleId = Number(id);
  const validId =
    id !== undefined &&
    /^\d+$/.test(id) &&
    Number.isSafeInteger(articleId) &&
    articleId > 0;
  const detail = useQuery({
    queryKey: ['adminEditor', 'detail', articleId],
    queryFn: () => getEditorArticle(articleId),
    enabled: validId,
    retry: shouldRetryDashboardQuery,
    refetchOnWindowFocus: false,
  });

  if (id === undefined) return <ArticleEditorSection key="new" />;
  if (validId && detail.isSuccess)
    return <ArticleEditorSection key={id} initial={detail.data} />;
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-700">
      <ManageNavigation />
      <main className="mx-auto max-w-[924px] px-6 pb-4 pt-8 max-mobile:px-4">
        {!validId ? (
          <p role="alert">
            올바르지 않은 게시글 ID입니다.{' '}
            <Link to="/manage" className="underline">
              관리자 홈
            </Link>
          </p>
        ) : detail.isPending ? (
          <p role="status">게시글 불러오는 중…</p>
        ) : detail.isError ? (
          <div role="alert" className="rounded-xl bg-white p-6">
            <p>
              {isDashboardForbidden(detail.error)
                ? '관리자 접근 권한을 확인해 주세요.'
                : '게시글을 불러오지 못했습니다.'}
            </p>
            {isDashboardForbidden(detail.error) ? (
              <Link
                to="/login"
                state={{ from: { pathname: `/manage/edit/${id}` } }}
                className="underline"
              >
                다시 로그인
              </Link>
            ) : (
              <button
                className="mt-3 underline"
                onClick={() => void detail.refetch()}
              >
                다시 시도
              </button>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default MANDTEPage;
