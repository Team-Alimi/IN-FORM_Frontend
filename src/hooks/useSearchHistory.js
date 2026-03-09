import { useState, useCallback } from "react";

const STORAGE_KEY = "evl_search_history";
const MAX_HISTORY = 5;

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const useSearchHistory = () => {
  const [history, setHistory] = useState(loadHistory);

  const addHistory = useCallback((keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((k) => k !== trimmed)].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeHistory = useCallback((keyword) => {
    setHistory((prev) => {
      const next = prev.filter((k) => k !== keyword);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addHistory, removeHistory, clearHistory };
};

export default useSearchHistory;
