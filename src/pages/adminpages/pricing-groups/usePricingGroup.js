import { useCallback, useEffect, useState } from "react";
import { fetchPricingGroupById } from "./api/groupsApi";

export function usePricingGroup(apiBase, groupId) {
  const [groupName, setGroupName] = useState("");
  const [excludedProductIds, setExcludedProductIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);

  const loadGroup = useCallback(async () => {
    if (!apiBase || !groupId) {
      setGroupName("");
      setExcludedProductIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const group = await fetchPricingGroupById(apiBase, groupId);
      setGroupName(String(group?.name || "").trim());
      setExcludedProductIds(new Set(group?.excludedProductIds || []));
    } catch {
      setGroupName("");
      setExcludedProductIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [apiBase, groupId]);

  useEffect(() => {
    let cancelled = false;
    loadGroup().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [loadGroup]);

  return { groupName, excludedProductIds, setExcludedProductIds, loading, reloadGroup: loadGroup };
}
