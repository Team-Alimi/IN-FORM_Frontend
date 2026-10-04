import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';

let scrollLocks = 0;
let restoreBodyScroll;

/**
 * BottomSheet Component
 * @param {boolean} isOpen - 바텀시트 열림 상태
 * @param {function} onClose - 바텀시트 닫기 함수
 * @param {string} className - 바텀시트 컨테이너 추가 스타일 (높이 조절 등)
 * @param {boolean} draggable - 상단 손잡이 드래그로 닫기 (기본값 true)
 * @param {React.ReactNode} children - 바텀시트 내부 콘텐츠
 */
const BottomSheet = ({ isOpen, onClose, className = '', maxHeight = '85%', draggable = true, children }) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const drag = useRef(null);
    const viewportRef = useRef(null);
    const isVisible = isOpen || shouldRender;

    useLayoutEffect(() => {
        if (!isVisible) return;
        const viewport = window.visualViewport;
        const handleViewportChange = () => {
            if (!viewportRef.current) return;
            viewportRef.current.style.height = `${viewport?.height ?? window.innerHeight}px`;
            viewportRef.current.style.top = `${viewport?.offsetTop ?? 0}px`;
        };
        handleViewportChange();
        viewport?.addEventListener('resize', handleViewportChange);
        viewport?.addEventListener('scroll', handleViewportChange);
        window.addEventListener('resize', handleViewportChange);
        return () => {
            viewport?.removeEventListener('resize', handleViewportChange);
            viewport?.removeEventListener('scroll', handleViewportChange);
            window.removeEventListener('resize', handleViewportChange);
        };
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;
        if (scrollLocks === 0) {
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;
            const previous = {};
            for (const key of ['position', 'top', 'left', 'width', 'overflow']) {
                previous[key] = document.body.style[key];
            }
            Object.assign(document.body.style, {
                position: 'fixed', top: `-${scrollY}px`, left: `-${scrollX}px`, width: '100%', overflow: 'hidden',
            });
            restoreBodyScroll = () => {
                Object.assign(document.body.style, previous);
                window.scrollTo(scrollX, scrollY);
            };
        }
        scrollLocks += 1;
        return () => {
            scrollLocks -= 1;
            if (scrollLocks === 0) restoreBodyScroll?.();
        };
    }, [isVisible]);

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
        } else {
            // 닫힘 애니메이션을 위해 0.3초 대기 후 언마운트
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender && !isOpen) return null;

    const content = (
        <div ref={viewportRef} data-bottom-sheet-viewport className="fixed left-0 right-0 top-0 h-dvh z-9999 flex items-end justify-center overflow-hidden">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 cursor-pointer ${isOpen ? 'animate-fade-in' : 'animate-fade-out'
                    }`}
                onClick={onClose}
            />

            {/* Sheet Content */}
            <div
                data-bottom-sheet
                style={{
                    maxHeight: `min(${maxHeight}, calc(100% - 48px - env(safe-area-inset-top, 0px)))`,
                    translate: draggable ? `0 ${dragOffset}px` : undefined,
                    transition: isDragging ? 'none' : 'translate 180ms ease-out',
                }}
                className={`relative w-full max-w-[430px] min-h-0 overflow-hidden bg-[#F4F4F4] rounded-t-[20px] shadow-lg flex flex-col ${isOpen ? 'animate-slide-up' : 'animate-slide-down'
                    } ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle Bar */}
                <div className="relative shrink-0">
                <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                    onLostPointerCapture={handlePointerEnd}
                    className={`flex h-12 mx-12 justify-center items-center ${draggable ? 'touch-none select-none cursor-grab active:cursor-grabbing' : ''}`}
                >
                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                </div>
                <button type="button" onClick={onClose} aria-label="바텀시트 닫기" className="absolute right-2 top-1 flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200">
                    <IoClose size={22} />
                </button>
                </div>

                <div data-bottom-sheet-content className="min-h-0 overflow-y-auto overscroll-contain px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default BottomSheet;
