import type { Abonnement } from "../types";
import {
  daysBetween,
  formatDateFR,
  getBillingProgress,
  pluralJour,
  totalSubscriptionDays,
  usedSubscriptionDays,
} from "../utils";
import StarFeedback from "./StarFeedback";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";

interface SubscriptionCardProps {
  abonnement: Abonnement;
  onRenouveler: (id: string) => void;
  onPayer: (id: string) => void;
}

export default function SubscriptionCard({
  abonnement,
  onRenouveler,
  onPayer,
}: SubscriptionCardProps) {
  const progress = getBillingProgress(
    abonnement.dateDebut,
    abonnement.dateFin,
  );

  const joursRestants = Math.max(
    0,
    daysBetween(new Date().toISOString(), abonnement.dateFin),
  );

  const totalDays = totalSubscriptionDays(
    abonnement.dateDebut,
    abonnement.dateFin,
  );

  const usedDays = usedSubscriptionDays(
    abonnement.dateDebut,
    abonnement.dateFin,
  );

  const isExpired = abonnement.statut === "expiré";
  const isActive = abonnement.statut === "actif";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 text-white bg-(--color-primary)">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-extrabold truncate">
                {abonnement.intituleOffre}
              </h3>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20">
                {abonnement.statut === "en_attente"
                  ? "En attente"
                  : abonnement.statut}
              </span>
            </div>

            <p className="text-white/85 text-sm mt-1 line-clamp-1">
              {abonnement.description || "—"}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-3xl font-extrabold leading-none">
              {abonnement.montant.toFixed(2)}
              <span className="text-base font-semibold ml-2">
                TND/{abonnement.type === "annuel" ? "an" : "mois"}
              </span>
            </div>

            <div className="text-white/80 text-sm mt-1">
              {abonnement.type === "annuel" ? "Annuel" : "Mensuel"}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Début
            </p>
            <p className="font-semibold text-gray-900">
              {formatDateFR(abonnement.dateDebut)}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              {isExpired ? "Terminé" : "Renouvellement"}
            </p>
            <p className="font-semibold text-gray-900">
              {formatDateFR(abonnement.dateFin)}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Tarif
            </p>
            <p className="font-semibold text-gray-900">
              {abonnement.montant.toFixed(2)} TND/
              {abonnement.type === "annuel" ? "an" : "mois"}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Période
            </p>
            <p className="font-semibold text-gray-900 capitalize">
              {abonnement.type}
            </p>
          </div>
        </div>

        {isActive && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progression du cycle</span>
              <span className="font-semibold text-(--color-primary)">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all bg-(--color-primary)"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-2 gap-3 flex-wrap">
              <span>
                {totalDays > 0
                  ? `${pluralJour(usedDays)} utilisé${
                      usedDays > 1 ? "s" : ""
                    } sur ${pluralJour(totalDays)} · ${pluralJour(
                      joursRestants,
                    )} restant${joursRestants > 1 ? "s" : ""}`
                  : `${pluralJour(joursRestants)} restant${
                      joursRestants > 1 ? "s" : ""
                    }`}
              </span>

              <span className="text-gray-400">
                Prochaine facturation : {formatDateFR(abonnement.dateFin)}
              </span>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <SubscriptionStatusBadge statut={abonnement.statut} />

              {!abonnement.peutRenouveler && (
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                  Service non disponible
                </span>
              )}

              {abonnement.peutRenouveler &&
                abonnement.statutDemande === "en_attente" && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    Demande en attente
                  </span>
                )}

              {abonnement.peutRenouveler &&
                abonnement.statutDemande === "acceptée" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    Paiement requis
                  </span>
                )}

              {abonnement.peutRenouveler &&
                abonnement.statutDemande === "refusée" && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    Demande refusée
                  </span>
                )}

              {abonnement.peutRenouveler &&
                abonnement.statutDemande === "expirée" && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                    Délai de paiement expiré
                  </span>
                )}
            </div>

            {abonnement.peutRenouveler &&
              abonnement.statutDemande === "acceptée" && (
                <button
                  type="button"
                  onClick={() => onPayer(abonnement.id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-(--color-primary) hover:opacity-90 transition"
                >
                  Payer
                </button>
              )}

            {abonnement.peutRenouveler &&
              abonnement.statutDemande !== "en_attente" &&
              abonnement.statutDemande !== "acceptée" && (
                <button
                  type="button"
                  onClick={() => onRenouveler(abonnement.id)}
                  className="px-4 py-2 rounded-xl border text-sm font-semibold transition border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white"
                >
                  {abonnement.statutDemande === "refusée" ||
                  abonnement.statutDemande === "expirée"
                    ? "Réessayer"
                    : "Renouveler"}
                </button>
              )}
          </div>
        )}

        <StarFeedback
          abonnementId={abonnement.id}
          noteFeedback={abonnement.noteFeedback}
        />
      </div>
    </div>
  );
}