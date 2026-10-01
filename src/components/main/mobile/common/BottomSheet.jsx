import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * BottomSheet Component
 * @param {boolean} isOpen - 바텀시트 열림 상태
 * @param {function} onClose - 바텀시트 닫기 함수
 * @param {string} className - 바텀시트 컨테이너 추가 스타일 (높이 조절 등)
 * @param {boolean} draggable - 상단 손잡이 드래그로 닫기 (기본값 true)
 * @param {React.ReactNode} children - 바텀시트 내부 콘텐츠
 */
const BottomSheet = ({ isOpen, onClose, className = '', draggable = true, children }) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const drag = useRef(null);

    const handlePointerDown = (event) => {
        if (!draggable || !isOpen || !event.isPrimary || event.button !== 0) return;
        drag.current = { id: event.pointerId, startY: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragOffset(0);
        setIsDragging(true);
    };
    const handlePointerMove = (event) => {
        if (drag.current?.id !== event.pointerId) return;
        setDragOffset(Math.max(0, event.clientY - drag.current.startY));
    };
    const handlePointerEnd = (event) => {
        if (drag.current?.id !== event.pointerId) return;
        const distance = event.clientY - drag.current.startY;
        drag.current = null;
        setIsDragging(false);
        if (event.type === 'pointerup' && distance >= 80) {
            onClose();
        } else {
            setDragOffset(0);
        }
    };

    useEffect(() => {
        if (isOpen) {
            drag.current = null;
            setDragOffset(0);
            setIsDragging(false);
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
                style={draggable ? {
                    translate: `0 ${dragOffset}px`,
                    transition: isDragging ? 'none' : 'translate 180ms ease-out',
                } : undefined}
                className={`relative w-full max-w-[430px] max-h-[85vh] bg-[#F4F4F4] rounded-t-[20px] shadow-lg flex flex-col ${isOpen ? 'animate-slide-up' : 'animate-slide-down'
                    } ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle Bar */}
                <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                    onLostPointerCapture={handlePointerEnd}
                    className={`flex justify-center pt-4 pb-2 shrink-0 ${draggable ? 'touch-none select-none cursor-grab active:cursor-grabbing' : ''}`}
                >
                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                </div>

                <div className="overflow-y-auto px-6 pb-5">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default BottomSheet;
