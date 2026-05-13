import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

const ML_URL = import.meta.env.VITE_ML_URL ?? "http://localhost:8000";
const ML_KEY = import.meta.env.VITE_ML_API_KEY ?? "axia-ml-secret-2025";

export type RiskLevel = "eleve" | "moyen" | "faible" | null;

export function useMyChurnRisk() {
  const { user } = useAuth();
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(null);
  const [probability, setProbability] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const cacheKey = `churn_risk_${user.id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      const { riskLevel: cachedRisk, probability: cachedProb } =
        JSON.parse(cached);
      setRiskLevel(cachedRisk);
      setProbability(cachedProb);
      setLoading(false);
      return;
    }

    fetch(`${ML_URL}/predict`, { headers: { "x-api-key": ML_KEY } })
      .then((r) => r.json())
      .then((data) => {
        const mine = data.predictions?.find(
          (p: { user_id: string }) =>
            p.user_id.toLowerCase() === user.id?.toLowerCase(),
        );
        if (mine) {
          setRiskLevel(mine.risk_level);
          setProbability(mine.churn_probability);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              riskLevel: mine.risk_level,
              probability: mine.churn_probability,
            }),
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  return { riskLevel, probability, loading };
}
