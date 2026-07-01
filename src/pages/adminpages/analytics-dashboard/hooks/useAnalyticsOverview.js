import { useCallback, useEffect, useState } from 'react';
import { fetchAnalyticsOverview } from '../service/analyticsOverviewService';

/**
 * Loads marketing analytics overview for the selected UK calendar date range.
 */
export function useAnalyticsOverview({ startDate, endDate, rangePreset, channel }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchAnalyticsOverview({
        startDate,
        endDate,
        rangePreset,
        channel,
      });
      if (response?.success) {
        setData(response);
      } else {
        setData(null);
        setError(response?.message || 'Failed to load analytics overview');
      }
    } catch (err) {
      setData(null);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to load analytics overview'
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, rangePreset, channel]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, retry: load };
}
