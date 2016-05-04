import type { Paiement } from "../types";
import { getTransactionCode } from "../utils";

interface RecentTransactionsCardProps {
  paiements: Paiement[];
  loading: boolean;
  onViewAll: () => void;
}

export default function RecentTransactionsCard({
  paiements,
  loading,
  onViewAll,
}: RecentTransactionsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">
          Transactions récentes
        </h2>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold hover:underline text-(--color-primary)"
        >
          Voir toutes →
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paiements.slice(0, 5).map((paiement, index) => (
            <div
              key={paiement.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-(--color-primary-soft)">
                  <svg
                    className="w-4 h-4 text-(--color-primary)"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {paiement.clientUsername}
                  </p>

                  <p className="text-xs text-gray-400">
                    {getTransactionCode(index)}
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold text-green-600">
                +{paiement.montant} TND
              </p>
            </div>
          ))}

          {paiements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Aucune transaction
            </p>
          )}
        </div>
      )}
    </div>
  );
}