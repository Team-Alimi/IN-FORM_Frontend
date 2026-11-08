import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** 목록의 검색·페이지 상태를 현재 방문 기록에 저장해 상세에서 돌아올 때 복원합니다. */
const useManageListHistoryState = <T>(initialValue: T) => {
  const location = useLocation();
  const navigate = useNavigate();
  const historyState =
    location.state && typeof location.state === 'object'
      ? (location.state as Record<string, unknown>)
      : {};
  const [value, setValue] = useState<T>(
    () => (historyState.manageListState as T | undefined) ?? initialValue
  );
  const latest = useRef(value);

  const update = (next: T | ((current: T) => T)) => {
    const resolved =
      typeof next === 'function'
        ? (next as (current: T) => T)(latest.current)
        : next;
    latest.current = resolved;
    setValue(resolved);
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: { ...historyState, manageListState: resolved },
      preventScrollReset: true,
    });
  };

  return [value, update] as const;
};

export default useManageListHistoryState;
