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
  onPay: () => void;
}

export default function SubscriptionSummary({
  selection,
  type,
  loading,
  onPay,
}: SubscriptionSummaryProps) {
  const montant = getSelectedAmount(selection, type);
  const selectionName = getSelectionName(selection);
  const selectionLabel = getSelectionLabel(selection);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h2>

      {!selection ? (
        <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
          Sélectionnez un service ou une offre
        </div>
      ) : (
        <>
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
              <span className="capitalize">{type}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Durée</span>
              <span>{type === "annuel" ? "12 mois" : "1 mois"}</span>
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
            className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 bg-(--color-primary)"
          >
            {loading ? "Redirection vers Stripe..." : `Payer ${montant} TND`}
          </button>
        </>
      )}
    </div>
  );
}