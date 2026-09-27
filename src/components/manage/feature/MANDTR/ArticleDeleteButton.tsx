import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { RiDeleteBinLine } from 'react-icons/ri';
import ArticleActionModal from '@/components/manage/common/ArticleActionModal';
import {
  isDashboardForbidden,
  runDashboardAction,
} from '@/api/manage/dashboard';

const ArticleDeleteButton = ({
  articleId,
  disabled,
}: {
  articleId: number;
  disabled: boolean;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => runDashboardAction('trash', [articleId]),
    onSuccess: async (result) => {
      if (!result.succeeded.includes(articleId)) {
        setError(
          result.failed.find((item) => item.id === articleId)?.message ??
            '게시글을 삭제하지 못했습니다. 다시 확인해 주세요.'
        );
        setConfirming(false);
        void queryClient.invalidateQueries({
          queryKey: ['adminArticleDetail', articleId],
        });
        return;
      }
      // The write succeeded even if a subsequent list refresh fails.
      await Promise.all(
        [
          'adminDashboard',
          'adminArticles',
          'adminArticleCounts',
          'adminArticleDetail',
          'adminEditor',
          'monthlyAll',
          'events',
          'eventDetail',
          'hotEvents',
          'bookmarks',
        ].map((key) =>
          queryClient.invalidateQueries({
            queryKey: [key],
            refetchType: 'none',
          })
        )
      );
      navigate('/manage/garbage', { replace: true });
    },
    onError: (cause) => {
      setConfirming(false);
      setError(
        isAxiosError(cause) &&
          typeof cause.response?.data?.error?.message === 'string'
          ? cause.response.data.error.message
          : '삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  const forbidden = isDashboardForbidden(mutation.error);
  const handleConfirm = () => {
    if (submitting.current || disabled || forbidden) return;
    submitting.current = true;
    mutation.mutate();
  };
  return (
    <div className="mr-auto">
      <button
        type="button"
        disabled={disabled || mutation.isPending || forbidden}
        onClick={() => {
          setError('');
          setConfirming(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 text-sm text-red-600 disabled:opacity-40"
      >
        <RiDeleteBinLine aria-hidden="true" />
        삭제하기
      </button>
      {error && (
        <p role="alert" className="mt-2 max-w-md text-sm text-red-600">
          {error}
        </p>
      )}
      {forbidden && (
        <Link
          to="/login"
          state={{ from: { pathname: `/manage/detail/${articleId}` } }}
          className="mt-2 block text-sm underline"
        >
          다시 로그인
        </Link>
      )}
      {confirming && (
        <ArticleActionModal
          action="trash"
          count={1}
          pending={mutation.isPending}
          onConfirm={handleConfirm}
          onCancel={() => {
            if (!submitting.current) setConfirming(false);
          }}
        />
      )}
    </div>
  );
};

export default ArticleDeleteButton;
