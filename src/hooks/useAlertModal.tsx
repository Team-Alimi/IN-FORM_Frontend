// 어떤 기능이 들어가야 하는가?
// 1. 모달을 화면에 띄우는 기능
// 1.1 모달을 띄울때 뒤에 오버레이를 깔고 그 오버레이가 깔렸을 때는 뒤의 요소들이 선택되지 않는 기능
// 2. 모달을 화면에서 내리는 기능 - 취소 버튼을 눌렀을 때
// 3. 확인 버튼을 눌렀을 때 받은 함수를 실행하는 기능
import { createPortal } from 'react-dom';
import { useState } from 'react';
import AlertModal from '@/components/manage/common/AlertModal';

const useAlertModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '기본 텍스트',
    onConfirm: () => {
      console.log('기본 텍스트 노출');
    },
  });

  const OpenModal = (title: string, onConfirm: () => void) => {
    setConfig({ title, onConfirm });
    setIsOpen(true);
  };
  const CloseModal = () => {
    setIsOpen(false);
    console.log('모달을 닫습니다.');
  };
  const ModalComponent = isOpen
    ? createPortal(
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <AlertModal
            title={config.title}
            onConfirm={() => {
              config.onConfirm;
              CloseModal();
            }}
            onCancel={CloseModal}
          />
        </div>,
        document.getElementById('modal-root')!
      )
    : null;

  return { OpenModal, ModalComponent };
};

export default useAlertModal;
