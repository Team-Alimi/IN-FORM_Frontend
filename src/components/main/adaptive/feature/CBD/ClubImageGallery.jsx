import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine } from "react-icons/ri";

const ImageCarousel = ({ images, initialIndex = 0, expanded = false, onSelect, children }) => {
  const viewport = useRef(null);
  const currentIndex = useRef(initialIndex);
  const [index, setIndex] = useState(initialIndex);
  useLayoutEffect(() => {
    const element = viewport.current;
    const observer = new ResizeObserver(() => {
      element.scrollTo({ left: currentIndex.current * element.clientWidth, behavior: "instant" });
    });
    element.scrollTo({ left: initialIndex * element.clientWidth, behavior: "instant" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [initialIndex]);
  const handlePage = (next) => {
    viewport.current.scrollTo({
      left: next * viewport.current.clientWidth,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };
  return (
    <section aria-label={expanded ? "확대 이미지" : "동아리 이미지"} aria-roledescription="캐러셀" className={`relative w-full overflow-hidden ${expanded ? 'h-[80dvh]' : 'aspect-square bg-gray-100'}`}>
      <div
        ref={viewport}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide"
        onScroll={(event) => {
          const element = event.currentTarget;
          const next = Math.max(0, Math.min(images.length - 1, Math.round(element.scrollLeft / element.clientWidth)));
          currentIndex.current = next;
          setIndex(next);
        }}
      >
        {images.map((image, i) => {
          const Tag = onSelect ? 'button' : 'div';
          return (
            <Tag key={image.file_url} className="flex h-full w-full shrink-0 snap-center items-center justify-center" {...(onSelect ? { type: 'button', onClick: () => onSelect(i), 'aria-label': `이미지 ${i + 1} 확대`, tabIndex: i === index ? 0 : -1 } : {})}>
              <img src={image.file_url} alt={image.original_name || `동아리 이미지 ${i + 1}`} draggable={false} className="h-full w-full select-none object-contain" />
            </Tag>
          );
        })}
      </div>
      {!images.length && <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">등록된 이미지가 없습니다.</p>}
      {images.length > 1 && (
        <>
          <button type="button" aria-label="이전 이미지" disabled={index === 0} onClick={() => handlePage(index - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white disabled:opacity-20"><RiArrowLeftSLine size={24} /></button>
          <button type="button" aria-label="다음 이미지" disabled={index === images.length - 1} onClick={() => handlePage(index + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white disabled:opacity-20"><RiArrowRightSLine size={24} /></button>
          <div className="absolute bottom-3 left-1/2 flex max-w-[80%] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full bg-black/45 px-2 text-white">
            {images.map((image, i) => <button key={image.file_url} type="button" aria-label={`${i + 1}번 이미지 보기`} aria-current={i === index ? 'true' : undefined} onClick={() => handlePage(i)} className="flex h-8 w-6 shrink-0 items-center justify-center"><span className={`h-1.5 rounded-full ${i === index ? 'w-3 bg-white' : 'w-1.5 bg-white/50'}`} /></button>)}
            <span className="sr-only" aria-live="polite">{index + 1} / {images.length}</span>
          </div>
        </>
      )}
      {children}
    </section>
  );
};

const ImageDialog = ({ images, index, onClose }) => {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return createPortal(
    <dialog ref={dialogRef} aria-label="동아리 이미지 확대" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[95dvh] w-[calc(100%_-_32px)] max-w-5xl overflow-hidden rounded-xl bg-black p-3 pt-12 text-white backdrop:bg-black/80">
      <button type="button" aria-label="확대 이미지 닫기" onClick={onClose} className="absolute right-2 top-2 rounded-full p-2 hover:bg-white/20"><RiCloseLine size={24} /></button>
      <ImageCarousel images={images} initialIndex={index} expanded />
    </dialog>, document.body
  );
};

const ClubImageGallery = ({ images, children }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  return <>
    <ImageCarousel images={images} onSelect={setSelectedIndex}>{children}</ImageCarousel>
    {selectedIndex !== null && <ImageDialog images={images} index={selectedIndex} onClose={() => setSelectedIndex(null)} />}
  </>;
};

export default ClubImageGallery;
