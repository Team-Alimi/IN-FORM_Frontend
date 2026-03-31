interface AlertModalProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AlertModal = ({ title, onConfirm, onCancel }: AlertModalProps) => {
  return (
    <div className="flex flex-col justify-center gap-3 items-center rounded-md bg-white shadow-sm p-8">
      <div className="text-lg text-center">
        {title.split(/(?<=[.?])\s*/).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
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
