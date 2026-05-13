import type { BillingType, Selection } from "../types";
import {
  getSelectedAmount,
  getSelectionLabel,
  getSelectionName,
} from "../utils";
import StarRating from "./StarRating";

interface SubscriptionSummaryProps {
  selection: Selection | null;
  type: BillingType;
  loading: boolean;
  payError: string;
  onTypeChange: (type: BillingType) => void;
  onPay: () => void;
}

export default function SubscriptionSummary({
  selection,
  type,
  loading,
  payError,
  onTypeChange,
  onPay,
}: SubscriptionSummaryProps) {
  const montant = getSelectedAmount(selection, type);
  const selectionName = getSelectionName(selection);
  const selectionLabel = getSelectionLabel(selection);

  const isOffre = selection?.kind === "offre";
  const typeAffiche = isOffre
    ? "Offre pack"
    : type === "annuel"
      ? "Annuel"
      : "Mensuel";
  const dureeAffiche = isOffre
    ? `${selection.item.dureeEnMois} mois`
    : type === "annuel"
      ? "12 mois"
      : "1 mois";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h2>

      {!selection ? (
        <div className="flex flex-col items-center justify-center h-56 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Aucune sélection
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Cliquez sur un service ou une offre
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Toggle mensuel/annuel — uniquement pour les services */}
          {!isOffre && (
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => onTypeChange("mensuel")}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  type === "mensuel"
                    ? "text-white border-transparent"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
                style={
                  type === "mensuel"
                    ? {
                        background: "var(--color-primary)",
                        borderColor: "var(--color-primary)",
                      }
                    : undefined
                }
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => onTypeChange("annuel")}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  type === "annuel"
                    ? "text-white border-transparent"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
                style={
                  type === "annuel"
                    ? {
                        background: "var(--color-primary)",
                        borderColor: "var(--color-primary)",
                      }
                    : undefined
                }
              >
                Annuel
              </button>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{selectionLabel}</span>
              <span className="font-medium">{selectionName}</span>
            </div>

            <StarRating
              moyenne={selection.item.moyenneNote}
              nombreAvis={selection.item.nombreAvis}
            />

            <div className="flex justify-between text-sm text-gray-600">
              <span>Type</span>
              <span className="capitalize">{typeAffiche}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Durée</span>
              <span>{dureeAffiche}</span>
            </div>

            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{montant} TND</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onPay}
            disabled={loading}
            className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{ background: "var(--color-primary)" }}
          >
            {loading ? "Redirection vers Stripe..." : `Payer ${montant} TND`}
          </button>

          {payError && (
            <p className="text-sm text-blue-600 text-center mt-3">{payError}</p>
          )}
        </>
      )}
    </div>
  );
}
