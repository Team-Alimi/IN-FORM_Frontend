import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * BottomSheet Component
 * @param {boolean} isOpen - 바텀시트 열림 상태
 * @param {function} onClose - 바텀시트 닫기 함수
 * @param {string} className - 바텀시트 컨테이너 추가 스타일 (높이 조절 등)
 * @param {React.ReactNode} children - 바텀시트 내부 콘텐츠
 */
const BottomSheet = ({ isOpen, onClose, className = '', children }) => {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = 'hidden';
        } else {
            // 닫힘 애니메이션을 위해 0.3초 대기 후 언마운트
            const timer = setTimeout(() => {
                setShouldRender(false);
                document.body.style.overflow = 'unset';
            }, 300);
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!shouldRender && !isOpen) return null;

    const content = (
        <div className="fixed inset-0 z-9999 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 cursor-pointer ${isOpen ? 'animate-fade-in' : 'animate-fade-out'
                    }`}
                onClick={onClose}
            />

            {/* Sheet Content */}
            <div
                className={`relative w-full max-w-[430px] max-h-[85vh] bg-[#F4F4F4] rounded-t-[20px] shadow-lg flex flex-col ${isOpen ? 'animate-slide-up' : 'animate-slide-down'
                    } ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle Bar */}
                <div className="flex justify-center pt-4 pb-2 shrink-0">
                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                </div>

                <div className="overflow-y-auto px-6 pb-10">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default BottomSheet;
