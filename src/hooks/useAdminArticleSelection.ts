import { useEffect, useRef, useState } from 'react';

/** 페이지를 넘겨도 선택된 행을 보존하고, 전체 조회 실패 시 부분 선택을 막습니다. */
const useAdminArticleSelection = <T extends { id: number }>() => {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [selectionError, setSelectionError] = useState('');
  const requestId = useRef(0);
  const selected = selectedRows.map((row) => row.id);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    []
  );

  const resetSelection = () => {
    requestId.current += 1;
    setSelectedRows([]);
    setIsSelectingAll(false);
    setSelectionError('');
  };

  const updateSelection = (ids: number[], visibleRows: T[]) => {
    const wanted = new Set(ids);
    setSelectedRows((previous) => {
      const rows = new Map(previous.map((row) => [row.id, row]));
      visibleRows.forEach((row) => rows.set(row.id, row));
      return [...rows.values()].filter((row) => wanted.has(row.id));
    });
    setSelectionError('');
  };

  const selectAll = async (
    fetchRows: () => Promise<T[]>,
    totalItems: number
  ) => {
    if (isSelectingAll) return;
    if (totalItems > 0 && selected.length === totalItems) {
      resetSelection();
      return;
    }
    const currentRequest = ++requestId.current;
    setIsSelectingAll(true);
    setSelectionError('');
    try {
      const rows = await fetchRows();
      if (requestId.current === currentRequest) setSelectedRows(rows);
    } catch {
      if (requestId.current === currentRequest)
        setSelectionError(
          '전체 목록을 불러오지 못했습니다. 다시 시도해 주세요.'
        );
    } finally {
      if (requestId.current === currentRequest) setIsSelectingAll(false);
    }
  };

  return {
    selected,
    selectedRows,
    isSelectingAll,
    selectionError,
    resetSelection,
    updateSelection,
    selectAll,
  };
};

export default useAdminArticleSelection;
