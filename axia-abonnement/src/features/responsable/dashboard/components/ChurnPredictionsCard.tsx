import { useEffect, useState } from "react";
import axios from "axios";
import { BrainCircuit } from "lucide-react";
import axiosInstance from "../../../../services/api/axiosInstance";

const ML_URL = import.meta.env.VITE_ML_URL ?? "http://localhost:8000";
const ML_KEY = import.meta.env.VITE_ML_API_KEY ?? "";

interface Prediction {
  user_id: string;
  churn_probability: number;
  risk_level: string;
}

interface ClientInfo {
  id: string;
  username: string;
  email: string;
}

type RiskFilter = "tous" | "eleve" | "moyen" | "faible";

const RISK_LABELS: Record<string, string> = {
  eleve: "Élevé",
  moyen: "Moyen",
  faible: "Faible",
};

const RISK_DOT: Record<string, string> = {
  eleve: "bg-red-500",
  moyen: "bg-amber-400",
  faible: "bg-green-500",
};

const RISK_ACTIVE_STYLE: Record<string, string> = {
  eleve: "bg-red-50 border-red-300",
  moyen: "bg-amber-50 border-amber-300",
  faible: "bg-green-50 border-green-300",
};

const RISK_TEXT: Record<string, string> = {
  eleve: "text-red-600",
  moyen: "text-amber-500",
  faible: "text-green-600",
};

export default function ChurnPredictionsCard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [clients, setClients] = useState<Map<string, ClientInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filtreRisque, setFiltreRisque] = useState<RiskFilter>("eleve");

  useEffect(() => {
    Promise.all([
      axios.get<{ predictions: Prediction[] }>(`${ML_URL}/predict`, {
        headers: { "x-api-key": ML_KEY },
      }),
      axiosInstance.get<ClientInfo[]>("/users/clients"),
    ])
      .then(([mlRes, clientsRes]) => {
        const map = new Map<string, ClientInfo>();
        (clientsRes.data ?? []).forEach((c: ClientInfo) =>
          map.set(c.id.toLowerCase(), c),
        );
        setPredictions(mlRes.data.predictions ?? []);
        setClients(map);
      })
      .catch((err) => {
        console.error("ChurnCard error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const mesPredictions = predictions
    .filter((p) => clients.has(p.user_id.toLowerCase()))
    .sort((a, b) => b.churn_probability - a.churn_probability);

  const counts = {
    eleve: mesPredictions.filter((p) => p.risk_level === "eleve").length,
    moyen: mesPredictions.filter((p) => p.risk_level === "moyen").length,
    faible: mesPredictions.filter((p) => p.risk_level === "faible").length,
  };

  const listeFiltre =
    filtreRisque === "tous"
      ? mesPredictions
      : mesPredictions.filter((p) => p.risk_level === filtreRisque);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <BrainCircuit className="w-5 h-5 text-blue-500 shrink-0" />
        <h2 className="text-base font-bold text-gray-900">Risque de churn</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {mesPredictions.length} clients analysés
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {(["eleve", "moyen", "faible"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFiltreRisque(filtreRisque === r ? "tous" : r)}
            className={`flex flex-col items-center justify-center py-2 rounded-xl border text-center transition-all ${
              filtreRisque === r
                ? RISK_ACTIVE_STYLE[r]
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className={`text-lg font-extrabold leading-none ${RISK_TEXT[r]}`}>
              {counts[r]}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">{RISK_LABELS[r]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : listeFiltre.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6 flex-1">
          Aucun résultat
        </p>
      ) : (
        <div className="space-y-1 overflow-y-auto flex-1" style={{ maxHeight: "220px" }}>
          {listeFiltre.map((p) => {
            const client = clients.get(p.user_id.toLowerCase());
            return (
              <div
                key={p.user_id}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "var(--color-primary-soft)",
                    color: "var(--color-primary)",
                  }}
                >
                  {(client?.username ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-none">
                    {client?.username ?? p.user_id}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{client?.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-gray-700">
                    {(p.churn_probability * 100).toFixed(0)}%
                  </span>
                  <span className={`w-2 h-2 rounded-full ${RISK_DOT[p.risk_level] ?? "bg-gray-300"}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && listeFiltre.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {RISK_LABELS[filtreRisque] ?? "Tous"} · {listeFiltre.length} client(s)
          </span>
          <div className="flex gap-1">
            {(["eleve", "moyen", "faible"] as const).map((r) => (
              <span key={r} className={`w-2 h-2 rounded-full ${RISK_DOT[r]}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}