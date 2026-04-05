import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// TODO: API 연동 시 아래 줄로 교체
// import { getAdminArticleDetail } from '@/api/manage/adminArticles';
import { getMockAdminArticleDetail } from '@/mocks/adminArticlesMock';
import ManageHeader from '../../../components/manage/common/ManageHeader';
import Menu from '../../../components/manage/common/Menu';
import BackBtn from '../../../components/manage/common/BackBtn';
import { RiPencilLine, RiDeleteBin6Line, RiExternalLinkLine } from 'react-icons/ri';

const MANDTRPage = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = Number(id);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminArticleDetail', articleId],
    queryFn: () => getMockAdminArticleDetail(articleId), // TODO: API 연동 시 → () => getAdminArticleDetail(articleId)
    enabled: !!articleId,
  });

  return (
    <div className="flex flex-col h-screen">
      <ManageHeader />
      <div className="flex flex-1 overflow-hidden">
        <Menu />
        <main className="flex-1 overflow-auto p-6">
          <BackBtn label="뒤로 가기" />

          {isLoading && (
            <div className="mt-8 text-center text-gray-400 text-sm">불러오는 중...</div>
          )}

          {isError && (
            <div className="mt-8 text-center text-red-400 text-sm">게시글을 불러올 수 없습니다.</div>
          )}

          {data && (
            <div className="mt-5 bg-white rounded-2xl shadow-sm p-8">
              {/* 카테고리 badge */}
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                {data.categories?.category_name ?? '미분류'}
              </span>

              {/* 제목 + 최종수정일 */}
              <div className="flex items-start justify-between gap-4 mt-3">
                <h2 className="text-base font-bold text-gray-900 leading-snug flex-1">
                  {data.title}
                </h2>
                <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                  최종수정일{' '}
                  {data.admin_modified_at
                    ? data.admin_modified_at.slice(0, 10).replace(/-/g, '.')
                    : data.updated_at.slice(0, 10).replace(/-/g, '.')}
                </span>
              </div>

              {/* 출처 chips */}
              {data.vendors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.vendors.map((v) => (
                    <a
                      key={v.vendor_id}
                      href={v.original_url ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      {v.vendor_name}
                      <RiExternalLinkLine size={12} className="text-gray-400" />
                    </a>
                  ))}
                </div>
              )}

              {/* 메타 정보 */}
              <div className="flex gap-6 mt-4 text-sm text-gray-600">
                <span>
                  <span className="text-gray-400 mr-1">ID</span>
                  {data.id}
                </span>
                <span>
                  <span className="text-gray-400 mr-1">행사기간</span>
                  {data.start_date} - {data.due_date}
                </span>
              </div>

              <hr className="my-4 border-gray-100" />

              {/* 본문 */}
              <div
                className="text-sm text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_p]:mb-2"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />

              {/* 하단 버튼 */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => navigate(`/manage/edit/${articleId}`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-600 hover:bg-gray-200"
                >
                  수정하기
                  <RiPencilLine size={15} />
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 text-sm text-red-400 hover:bg-red-200">
                  삭제하기
                  <RiDeleteBin6Line size={15} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MANDTRPage;
