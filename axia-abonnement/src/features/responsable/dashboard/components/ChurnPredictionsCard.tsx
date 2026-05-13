import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { useChurn } from "../../../../contexts/ChurnContext";

type RiskFilter = "tous" | "eleve" | "moyen" | "faible";

const RISK_LABELS: Record<string, string> = {
  eleve: "Élevé",
  moyen: "Moyen",
  faible: "Faible",
};

const RISK_BAR: Record<string, string> = {
  eleve: "bg-blue-700",
  moyen: "bg-blue-400",
  faible: "bg-sky-300",
};

const RISK_ACTIVE_STYLE: Record<string, string> = {
  eleve: "bg-blue-100 border-blue-400",
  moyen: "bg-blue-50 border-blue-300",
  faible: "bg-sky-50 border-sky-300",
};

const RISK_TEXT: Record<string, string> = {
  eleve: "text-blue-800",
  moyen: "text-blue-500",
  faible: "text-sky-500",
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

export default function ChurnPredictionsCard() {
  const { riskMap, loading, error } = useChurn();
  const [filtreRisque, setFiltreRisque] = useState<RiskFilter>("eleve");

  const mesPredictions = Array.from(riskMap.values()).sort(
    (a, b) => b.churn_probability - a.churn_probability,
  );

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
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-center transition-all ${
              filtreRisque === r
                ? RISK_ACTIVE_STYLE[r]
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span
              className={`text-xl font-extrabold leading-none ${RISK_TEXT[r]}`}
            >
              {counts[r]}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {RISK_LABELS[r]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      ) : listeFiltre.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6 flex-1">
          Aucun résultat
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 max-h-55">
          {listeFiltre.map((p, idx) => {
            const pct = Math.round(p.churn_probability * 100);
            return (
              <div
                key={p.user_id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                >
                  {(p.username ?? "?").charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-none">
                    {p.username ?? p.user_id}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${RISK_BAR[p.risk_level] ?? "bg-gray-300"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ${RISK_TEXT[p.risk_level]}`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && listeFiltre.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {filtreRisque === "tous" ? "Tous" : RISK_LABELS[filtreRisque]} ·{" "}
            {listeFiltre.length} client(s)
          </span>
        </div>
      )}
    </div>
  );
}
