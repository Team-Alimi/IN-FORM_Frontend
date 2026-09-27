import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

const EditorDialog = ({
  title,
  children,
  pending = false,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  pending?: boolean;
  onCancel: () => void;
}) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-700 shadow-xl backdrop:bg-black/30"
    >
      <h2 className="mb-5 text-lg font-bold text-black">{title}</h2>
      {children}
    </dialog>
  );
};
export default EditorDialog;
