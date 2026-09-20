import { useEffect, useRef } from 'react';

interface Props {
  action: 'ready' | 'publish' | 'trash';
  count: number;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
const ArticleActionModal = ({
  action,
  count,
  pending,
  onConfirm,
  onCancel,
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="review-confirm-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
      className="m-auto w-[calc(100%_-_32px)] max-w-md rounded-2xl bg-white p-6 text-gray-800 shadow-xl backdrop:bg-black/40"
    >
      <h2 id="review-confirm-title" className="text-lg font-bold">
        {action === 'publish'
          ? '운영 반영'
          : action === 'ready'
            ? '반영대기로 이동'
            : '휴지통으로 이동'}
      </h2>
      <p className="mt-4 text-sm">
        선택한 {count}건을{' '}
        {action === 'publish'
          ? '운영에 반영하시겠습니까?'
          : action === 'ready'
            ? '반영대기 상태로 변경하시겠습니까?'
            : '휴지통으로 이동하시겠습니까?'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        {action === 'publish'
          ? '운영에 반영하면 사용자에게 게시글이 공개됩니다.'
          : action === 'ready'
            ? '반영 대기 화면에서 운영 반영을 진행할 수 있습니다.'
            : '삭제된 게시글은 휴지통에서 복구할 수 있습니다.'}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          disabled={pending}
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-40"
        >
          취소
        </button>
        <button
          disabled={pending}
          onClick={onConfirm}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          {pending ? '처리 중…' : '확인'}
        </button>
      </div>
    </dialog>
  );
};
export default ArticleActionModal;
