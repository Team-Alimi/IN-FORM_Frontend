interface AlertModalProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AlertModal = ({ title, onConfirm, onCancel }: AlertModalProps) => {
  return (
    <div className="w-70 h-32 flex flex-col justify-center gap-3 items-center rounded-md bg-white shadow-sm">
      <div className="text-lg font-semibold">{title}</div>
      <div className="flex flex-row justify-between gap-8">
        <button
          className="px-8 py-2 bg-gray-200 rounded-md text-sm"
          onClick={onCancel}
        >
          취소
        </button>
        <button
          className="px-8 py-2 bg-red-200 rounded-md text-sm"
          onClick={onConfirm}
        >
          확인
        </button>
      </div>
    </div>
  );
};
export default AlertModal;
