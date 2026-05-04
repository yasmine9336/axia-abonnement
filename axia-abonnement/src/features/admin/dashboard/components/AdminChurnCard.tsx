import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { useChurnPredictions } from "../../../../hooks/useChurnPredictions";

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

const RISK_ACTIVE: Record<string, string> = {
  eleve: "bg-red-50 border-red-300",
  moyen: "bg-amber-50 border-amber-300",
  faible: "bg-green-50 border-green-300",
};

const RISK_TEXT: Record<string, string> = {
  eleve: "text-red-600",
  moyen: "text-amber-500",
  faible: "text-green-600",
};

type RiskFilter = "tous" | "eleve" | "moyen" | "faible";

export default function AdminChurnCard() {
  const { riskMap, loading } = useChurnPredictions();
  const [filtreRisque, setFiltreRisque] = useState<RiskFilter>("eleve");
  const navigate = useNavigate();

  const predictions = Array.from(riskMap.values()).sort(
    (a, b) => b.churn_probability - a.churn_probability,
  );

  const counts = {
    eleve: predictions.filter((p) => p.risk_level === "eleve").length,
    moyen: predictions.filter((p) => p.risk_level === "moyen").length,
    faible: predictions.filter((p) => p.risk_level === "faible").length,
  };

  const listeFiltre =
    filtreRisque === "tous"
      ? predictions
      : predictions.filter((p) => p.risk_level === filtreRisque);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col self-start">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <BrainCircuit className="w-5 h-5 text-blue-500 shrink-0" />
        <h2 className="text-base font-bold text-gray-900">Risque de churn</h2>
      </div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">
          {predictions.length} clients analysés
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/admin/archive")}
          className="text-xs font-semibold hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          Voir tous →
        </button>
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(["eleve", "moyen", "faible"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFiltreRisque(filtreRisque === r ? "tous" : r)}
            className={`flex flex-col items-center justify-center py-2 rounded-xl border text-center transition-all ${
              filtreRisque === r
                ? RISK_ACTIVE[r]
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className={`text-lg font-extrabold leading-none ${RISK_TEXT[r]}`}>
              {counts[r]}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {RISK_LABELS[r]}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : listeFiltre.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Aucun résultat
        </p>
      ) : (
        <div className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: "145px" }}>
          {listeFiltre.map((p) => (
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
                {(p.username ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate leading-none">
                  {p.username ?? p.user_id}
                </p>
                <p className="text-xs text-gray-400 truncate">{p.email}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-gray-700">
                  {(p.churn_probability * 100).toFixed(0)}%
                </span>
                <span className={`w-2 h-2 rounded-full ${RISK_DOT[p.risk_level] ?? "bg-gray-300"}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
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