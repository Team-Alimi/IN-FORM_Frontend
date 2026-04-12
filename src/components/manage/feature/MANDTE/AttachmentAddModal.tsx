import { useState } from 'react';

const AttachmentAddModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: (url: string) => void;
  onCancel: () => void;
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }
    onConfirm(url.trim());
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-lg p-6 w-96 flex flex-col gap-4">
        <h2 className="text-sm font-semibold">첨부파일 URL 추가</h2>
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="URL을 입력하세요"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 text-sm bg-primary text-white rounded"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentAddModal;