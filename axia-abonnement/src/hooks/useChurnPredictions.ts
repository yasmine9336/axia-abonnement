import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../services/api/axiosInstance";

const ML_URL = import.meta.env.VITE_ML_URL ?? "http://localhost:8000";
const ML_KEY = import.meta.env.VITE_ML_API_KEY ?? "";

export interface ChurnPrediction {
  user_id: string;
  churn_probability: number;
  risk_level: string;
  username?: string;
  email?: string;
}

interface ClientInfo {
  id: string;
  username: string;
  email: string;
}

export function useChurnPredictions() {
  const [riskMap, setRiskMap] = useState<Map<string, ChurnPrediction>>(
    new Map(),
  );
  const [riskMapByUsername, setRiskMapByUsername] = useState<
    Map<string, ChurnPrediction>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      axios.get<{ predictions: ChurnPrediction[] }>(`${ML_URL}/predict`, {
        headers: { "x-api-key": ML_KEY },
      }),
      axiosInstance.get<ClientInfo[]>("/users/clients"),
    ])
      .then(([mlRes, clientsRes]) => {
        const predictions = mlRes.data.predictions ?? [];
        const clients = clientsRes.data ?? [];

        const byId = new Map<string, ChurnPrediction>();
        const byUsername = new Map<string, ChurnPrediction>();

        const clientById = new Map<string, ClientInfo>();
        clients.forEach((c) => clientById.set(c.id.toLowerCase(), c));

        predictions.forEach((p) => {
          const client = clientById.get(p.user_id.toLowerCase());
          if (!client) return;
          const enriched = {
            ...p,
            username: client.username,
            email: client.email,
          };
          byId.set(p.user_id.toLowerCase(), enriched);
          byUsername.set(client.username.toLowerCase(), enriched);
        });

        setRiskMap(byId);
        setRiskMapByUsername(byUsername);
      })
      .catch((e) => {
        setError(e?.message ?? "Erreur ML");
      })
      .finally(() => setLoading(false));
  }, []);

  return { riskMap, riskMapByUsername, loading, error };
}
