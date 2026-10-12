import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchArticleSummary } from '@/api/main/articleSummary';

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 4;

const useArticleSummary = (articleId, status, initialSummary) => {
  const [pollingId, setPollingId] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const attemptsRef = useRef(0);

  useEffect(() => {
    attemptsRef.current = 0;
    setAttempts(0);
    if (!articleId || status !== 'PENDING') return;

    const timer = window.setTimeout(() => setPollingId(articleId), POLL_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [articleId, status]);

  const summaryQuery = useQuery({
    queryKey: ['articleSummary', articleId],
    queryFn: async ({ signal }) => {
      try {
        return await fetchArticleSummary(articleId, signal);
      } finally {
        if (!signal.aborted) {
          attemptsRef.current += 1;
          setAttempts(attemptsRef.current);
        }
      }
    },
    enabled: status === 'PENDING' && pollingId === articleId && attempts < MAX_ATTEMPTS,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: (query) =>
      query.state.data?.summary_status === 'PENDING' && attempts < MAX_ATTEMPTS
        ? POLL_INTERVAL_MS
        : false,
  });

  if (status === 'READY') {
    return { summary: initialSummary, summaryPending: false };
  }

  if (status !== 'PENDING') {
    return { summary: null, summaryPending: false };
  }

  if (summaryQuery.data?.summary_status === 'READY') {
    return { summary: summaryQuery.data.summary, summaryPending: false };
  }

  return {
    summary: null,
    summaryPending: !summaryQuery.isError &&
      summaryQuery.data?.summary_status !== 'NONE' &&
      attempts < MAX_ATTEMPTS,
  };
};

export default useArticleSummary;
