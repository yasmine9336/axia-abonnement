import { CalendarDays, MessageSquare, Phone } from "lucide-react";
import EmptyState from "../../../../components/common/EmptyState";
import LoadingState from "../../../../components/common/LoadingState";
import Pagination from "../../../../components/common/Pagination";
import type { Client } from "../types";
import { formatDateFR } from "../utils";
import { useChurnPredictions } from "../../../../hooks/useChurnPredictions";

interface ResponsableClientsGridProps {
  clients: Client[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpenSubscriptions: (client: Client) => void;
  onOpenConversation: (client: Client) => void;
}

const RISK_STYLE: Record<string, string> = {
  eleve: "bg-red-100 text-red-700",
  moyen: "bg-amber-100 text-amber-700",
  faible: "bg-green-100 text-green-700",
};

const RISK_LABEL: Record<string, string> = {
  eleve: "Risque élevé",
  moyen: "Risque moyen",
  faible: "Risque faible",
};

export default function ResponsableClientsGrid({
  clients,
  loading,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onOpenSubscriptions,
  onOpenConversation,
}: ResponsableClientsGridProps) {
  const { riskMap } = useChurnPredictions();

  if (loading) return <LoadingState heightClassName="min-h-40" />;

  if (totalItems === 0) {
    return <EmptyState title="Aucun client trouvé" />;
  }

  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {clients.map((client) => {
          const prediction = riskMap.get(client.id.toLowerCase());

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-gray-200 p-3 w-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-(--color-primary-soft) flex items-center justify-center font-bold text-(--color-primary)">
                    {client.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">
                        {client.username}
                      </p>

                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          client.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {client.isActive ? "actif" : "inactif"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 truncate">{client.email}</p>
                  </div>
                </div>
              </div>

              {/* Badge risque de churn */}
              {prediction && (
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${RISK_STYLE[prediction.risk_level] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {RISK_LABEL[prediction.risk_level] ?? prediction.risk_level}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(prediction.churn_probability * 100).toFixed(0)}% churn
                  </span>
                </div>
              )}

              <div className="my-3 border-t border-gray-100" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1 flex items-center gap-2">
                    <Phone size={14} /> TÉLÉPHONE
                  </p>
                  <p className="font-semibold text-gray-900">
                    {client.phoneNumber || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1 flex items-center gap-2">
                    <CalendarDays size={14} /> MEMBRE DEPUIS
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDateFR(client.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSubscriptions(client)}
                  className="w-full border border-(--color-primary)/30 text-(--color-primary) hover:bg-(--color-primary-soft) rounded-lg px-2.5 py-1.5 text-xs font-semibold transition whitespace-nowrap truncate"
                  title="Voir abonnements"
                >
                  Voir abonnements
                </button>

                <button
                  type="button"
                  onClick={() => onOpenConversation(client)}
                  className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                  title="Message"
                >
                  <MessageSquare size={14} />
                  Message
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="client(s)"
        onPageChange={onPageChange}
      />
    </>
  );
}