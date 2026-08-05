import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/userService";

export function useProfileCompletion() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompletion = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getProfileCompletion();
      const payload = res?.data?.data || res?.data;
      setData(payload);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletion();
  }, [fetchCompletion]);

  const completion = data?.completion ?? data?.completionPercentage ?? 55;
  const profileStrength = data?.profileStrength || "Good Progress";
  const completedSections = data?.completedSections || [];
  const missingSections = data?.missingSections || [];
  const estimatedTime = data?.estimatedTime || data?.estimatedTimeMinutes || 3;
  const nextRecommendedSection = data?.nextRecommendedSection || null;

  return {
    completion,
    profileStrength,
    completedSections,
    missingSections,
    estimatedTime,
    nextRecommendedSection,
    raw: data,
    loading,
    refetch: fetchCompletion,
  };
}

export default useProfileCompletion;
