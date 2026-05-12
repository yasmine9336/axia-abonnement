import { X } from "lucide-react";
import EmptyState from "../../../../components/common/EmptyState";
import LoadingState from "../../../../components/common/LoadingState";
import type { AbonnementClientDto, Client } from "../types";
import { formatDateFR } from "../utils";

interface ClientSubscriptionsModalProps {
  open: boolean;
  selectedClient: Client | null;
  subscriptions: AbonnementClientDto[];
  loading: boolean;
  onClose: () => void;
}

export default function ClientSubscriptionsModal({
  open,
  selectedClient,
  subscriptions,
  loading,
  onClose,
}: ClientSubscriptionsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Abonnements du client</p>

            <h3 className="text-lg font-bold text-gray-900">
              {selectedClient?.username ?? "—"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
            aria-label="Fermer la fenêtre"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <LoadingState heightClassName="min-h-40" />
          ) : subscriptions.length === 0 ? (
            <EmptyState title="Aucun abonnement trouvé pour ce client." />
          ) : (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="border border-gray-200 rounded-2xl p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {subscription.intituleOffre}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {subscription.type} ·{" "}
                        {Number(subscription.montant).toFixed(2)} TND
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateFR(subscription.dateDebut)} →{" "}
                        {formatDateFR(subscription.dateFin)}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        subscription.statut === "actif"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {subscription.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}