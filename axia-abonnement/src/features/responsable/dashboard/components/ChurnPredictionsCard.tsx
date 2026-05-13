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
  eleve: "bg-blue-900",   // très foncé → inchangé
  moyen: "bg-blue-500",   // moyen franc (au lieu de blue-400)
  faible: "bg-blue-200",  // très clair (au lieu de sky-200)
};

const RISK_ACTIVE_STYLE: Record<string, string> = {
  eleve: "bg-blue-100 border-blue-800",
  moyen: "bg-blue-50 border-blue-500",
  faible: "bg-slate-50 border-blue-200",
};

const RISK_TEXT: Record<string, string> = {
  eleve: "text-blue-900",   // très foncé
  moyen: "text-blue-500",   // moyen (au lieu de blue-400)
  faible: "text-blue-300",  // clair (au lieu de sky-400)
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-blue-200 text-blue-800",
  "bg-indigo-50 text-indigo-600",
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
        <p className="text-sm text-blue-600 text-center py-6">{error}</p>
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