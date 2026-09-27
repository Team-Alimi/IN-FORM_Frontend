import { useEffect, useRef } from 'react';

interface Props {
  action: 'ready' | 'publish' | 'trash' | 'restore' | 'delete';
  count: number;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
const COPY = {
  ready: {
    title: '반영대기로 이동',
    question: '반영대기 상태로 변경하시겠습니까?',
    description: '반영 대기 화면에서 운영 반영을 진행할 수 있습니다.',
  },
  publish: {
    title: '운영 반영',
    question: '운영에 반영하시겠습니까?',
    description: '운영에 반영하면 사용자에게 게시글이 공개됩니다.',
  },
  trash: {
    title: '휴지통으로 이동',
    question: '휴지통으로 이동하시겠습니까?',
    description: '삭제된 게시글은 휴지통에서 복구할 수 있습니다.',
  },
  restore: {
    title: '선택 복구',
    question: '삭제 직전 상태로 복구하시겠습니까?',
    description: '운영 상태였던 게시글은 복구하면 사용자에게 다시 공개됩니다.',
  },
  delete: {
    title: '영구 삭제',
    question: '영구 삭제하시겠습니까?',
    description:
      '게시글과 첨부 파일, 댓글, 북마크 등이 함께 삭제됩니다. 영구 삭제 후에는 복구할 수 없습니다.',
  },
};
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
        {COPY[action].title}
      </h2>
      <p className="mt-4 text-sm">
        선택한 {count}건을 {COPY[action].question}
      </p>
      <p className="mt-2 text-sm text-gray-500">{COPY[action].description}</p>
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
