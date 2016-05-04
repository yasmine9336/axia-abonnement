import EmptyState from "../../../../components/common/EmptyState";
import Pagination from "../../../../components/common/Pagination";
import type { Abonnement } from "../types";
import {
  daysLeft,
  formatDate,
  getInitials,
  pluralJour,
  progressPercent,
  totalSubscriptionDays,
  usedSubscriptionDays,
} from "../utils";
import AbonnementStatusPill from "./AbonnementStatusPill";
import { useChurn } from "../../../../contexts/ChurnContext";

const RISK_BADGE: Record<string, string> = {
  eleve: "bg-red-100 text-red-700",
  moyen: "bg-amber-100 text-amber-700",
  faible: "bg-green-100 text-green-700",
};

const RISK_LABEL: Record<string, string> = {
  eleve: "Risque élevé",
  moyen: "Risque moyen",
  faible: "Risque faible",
};

interface AbonnementsTableProps {
  abonnements: Abonnement[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function AbonnementsTable({
  abonnements,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: AbonnementsTableProps) {
  const { riskMap } = useChurn();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {totalItems === 0 ? (
        <EmptyState title="Aucun abonnement trouvé" />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {abonnements.map((abonnement) => {
              const left = daysLeft(abonnement.dateFin);
              const progress =
                abonnement.statut === "actif"
                  ? progressPercent(abonnement.dateDebut, abonnement.dateFin)
                  : 0;
              const totalDays = totalSubscriptionDays(abonnement.dateDebut, abonnement.dateFin);
              const usedDays = usedSubscriptionDays(abonnement.dateDebut, abonnement.dateFin);
              const remainingDays = left !== null ? Math.max(0, left) : 0;
              const prediction = riskMap.get(abonnement.clientId.toLowerCase());

              return (
                <div
                  key={abonnement.id}
                  className="rounded-2xl border border-gray-200 p-5 bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-(--color-primary-soft) text-(--color-primary)">
                        {getInitials(abonnement.clientUsername)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">
                            {abonnement.clientUsername}
                          </p>
                          <span className="text-xs text-gray-400">
                            {abonnement.clientEmail}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-(--color-primary)">
                            {abonnement.intituleOffre}
                          </span>
                          {" · "}
                          <span className="capitalize">{abonnement.type}</span>
                          {" · "}
                          <span className="font-semibold">
                            {Number(abonnement.montant).toFixed(2)} TND
                          </span>
                        </p>

                        <p className="text-xs text-gray-400">
                          Du {formatDate(abonnement.dateDebut)} au{" "}
                          {abonnement.dateFin ? formatDate(abonnement.dateFin) : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <AbonnementStatusPill statut={String(abonnement.statut)} />

                      {abonnement.statut === "actif" && left !== null && left <= 7 && left >= 0 && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                          Renouvelle dans {left}j
                        </span>
                      )}

                      {prediction && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${RISK_BADGE[prediction.risk_level] ?? "bg-gray-100 text-gray-600"}`}>
                          {RISK_LABEL[prediction.risk_level] ?? prediction.risk_level}
                        </span>
                      )}
                    </div>
                  </div>

                  {abonnement.statut === "actif" && abonnement.dateFin && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Cycle de facturation</span>
                        <span className="font-semibold text-(--color-primary)">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-(--color-primary)"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {totalDays > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          {pluralJour(usedDays)} utilisé{usedDays > 1 ? "s" : ""} sur{" "}
                          {pluralJour(totalDays)} · {pluralJour(remainingDays)} restant
                          {remainingDays > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            itemLabel="abonnement(s)"
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}