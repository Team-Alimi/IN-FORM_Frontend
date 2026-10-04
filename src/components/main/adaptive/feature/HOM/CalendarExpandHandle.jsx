import { useRef, useState } from 'react';

const CalendarExpandHandle = ({ enabled, onExpand }) => {
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const [distance, setDistance] = useState(0);
  const handleEnd = (event, cancelled = false) => {
    if (gesture.current?.id !== event.pointerId) return;
    const delta = event.clientY - gesture.current.y;
    suppressClick.current = cancelled || Math.abs(delta) > 8;
    gesture.current = null;
    setDistance(0);
    if (!cancelled && delta >= 60) onExpand();
  };
  return (
    <button
      type="button"
      aria-label="오늘의 월간 캘린더로 돌아가기"
      disabled={!enabled}
      className="flex h-9 w-full items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default"
      style={{ touchAction: enabled ? 'none' : 'auto' }}
      onPointerDown={(event) => {
        if (!enabled || !event.isPrimary || event.button !== 0) return;
        gesture.current = { id: event.pointerId, y: event.clientY };
        suppressClick.current = false;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (gesture.current?.id === event.pointerId)
          setDistance(Math.min(60, Math.max(0, event.clientY - gesture.current.y)));
      }}
      onPointerUp={(event) => handleEnd(event)}
      onPointerCancel={(event) => handleEnd(event, true)}
      onLostPointerCapture={(event) => handleEnd(event, true)}
      onClick={(event) => {
        if (event.detail === 0 || !suppressClick.current) onExpand();
        suppressClick.current = false;
      }}
    >
      <span aria-hidden="true" className="h-1 w-9 rounded-full bg-gray-200" style={{ transform: `translateY(${distance / 3}px)` }} />
    </button>
  );
};

export default CalendarExpandHandle;
