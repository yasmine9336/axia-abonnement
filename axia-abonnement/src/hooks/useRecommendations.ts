import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";

const ML_URL = import.meta.env.VITE_ML_URL ?? "http://localhost:8000";
const ML_KEY = import.meta.env.VITE_ML_API_KEY ?? "";

export interface Recommendation {
  type: "offre" | "service";
  item_id: string;
  intitule: string;
  description: string;
  prix: number;
  duree_mois: number | null;
  nb_services: number | null;
  avg_rating: number;
  secteur: string;
  score: number;
  is_diversity: boolean;
  reason: "similar" | "popular";
}

export function useRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    axios
      .get<{ recommendations: Recommendation[] }>(
        `${ML_URL}/recommend/${user.id}`,
        { headers: { "x-api-key": ML_KEY } },
      )
      .then((res) => setRecommendations(res.data.recommendations ?? []))
      .catch((e) => setError(e?.message ?? "Erreur ML"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return { recommendations, loading, error };
}