import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import axiosInstance from "../services/api/axiosInstance";
import type { ChurnPrediction } from "../hooks/useChurnPredictions";

const ML_URL = import.meta.env.VITE_ML_URL ?? "http://localhost:8000";
const ML_KEY = import.meta.env.VITE_ML_API_KEY ?? "";

interface ClientInfo { id: string; username: string; email: string }
interface ChurnCtx {
  riskMap: Map<string, ChurnPrediction>;
  riskMapByUsername: Map<string, ChurnPrediction>;
  loading: boolean;
  error: string | null;
}

const ChurnContext = createContext<ChurnCtx>({
  riskMap: new Map(), riskMapByUsername: new Map(), loading: true, error: null,
});

export function ChurnProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChurnCtx>({
    riskMap: new Map(), riskMapByUsername: new Map(), loading: true, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      axios.get<{ predictions: ChurnPrediction[] }>(`${ML_URL}/predict`, {
        headers: { "x-api-key": ML_KEY },
      }),
      axiosInstance.get<ClientInfo[]>("/users/clients"),
    ])
      .then(([mlRes, clientsRes]) => {
        if (cancelled) return;
        const byId = new Map<string, ChurnPrediction>();
        const byUsername = new Map<string, ChurnPrediction>();
        const clientById = new Map<string, ClientInfo>();
        (clientsRes.data ?? []).forEach((c) => clientById.set(c.id.toLowerCase(), c));
        (mlRes.data.predictions ?? []).forEach((p) => {
          const client = clientById.get(p.user_id.toLowerCase());
          const enriched = { ...p, username: client?.username, email: client?.email };
          byId.set(p.user_id.toLowerCase(), enriched);
          if (client) byUsername.set(client.username.toLowerCase(), enriched);
        });
        setState({ riskMap: byId, riskMapByUsername: byUsername, loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled)
          setState((s) => ({ ...s, loading: false, error: e?.message ?? "Erreur ML" }));
      });
    return () => { cancelled = true; };
  }, []);

  return <ChurnContext.Provider value={state}>{children}</ChurnContext.Provider>;
}

export const useChurn = () => useContext(ChurnContext);