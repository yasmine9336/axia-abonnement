import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";

const ML_URL = import.meta.env.VITE_ML_URL ?? "http://localhost:8000";
const ML_KEY = import.meta.env.VITE_ML_API_KEY ?? "";

export interface Recommendation {
  offre_id:     string;
  intitule:     string;
  description:  string;
  prix:         number;
  duree_mois:   number;
  nb_services:  number;
  avg_rating:   number;
  secteur:      string;
  score:        number;
  is_diversity: boolean;
  reason:       "similar" | "popular";
}

export function useRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    axios
      .get<{ recommendations: Recommendation[] }>(
        `${ML_URL}/recommend/${user.id}`,
        { headers: { "x-api-key": ML_KEY } },
      )
      .then((res) => {
        if (!cancelled) setRecommendations(res.data.recommendations ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Erreur ML");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  return { recommendations, loading, error };
}