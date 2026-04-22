import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

interface Abonnement {
  id: string;
  intituleOffre: string;
  description: string;
  type: string; // "mensuel" | "annuel" (ou autre)
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: "actif" | "en_attente" | "expiré";
  statutDemande?: string | null;
  aDejaFeedback?: boolean;
}

function StarFeedback({
  aboId,
  aDejaFeedback,
}: {
  aboId: string;
  aDejaFeedback?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);

  const alreadySent = (aDejaFeedback ?? false) || selected > 0;

  const handleClick = async (n: number) => {
    if (alreadySent) return;
    await axiosInstance.post("/feedbacks", { abonnementId: aboId, note: n });
    setSelected(n);
  };

  const label =
    selected > 0
      ? "Merci pour votre avis"
      : aDejaFeedback
        ? "Déjà noté"
        : "Notez ce service";

  return (
    <div className="mt-5 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              disabled={alreadySent}
              onClick={() => handleClick(i)}
              onMouseEnter={() => !alreadySent && setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="disabled:cursor-default"
              aria-label={`Noter ${i} étoiles`}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  selected > 0
                    ? i <= selected
                      ? "text-yellow-400"
                      : "text-gray-200"
                    : i <= hover
                      ? "text-yellow-400"
                      : "text-gray-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDateFR(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function getBillingProgress(dateDebut: string, dateFin: string) {
  const now = Date.now();
  const debut = new Date(dateDebut).getTime();
  const fin = new Date(dateFin).getTime();
  const denom = fin - debut || 1;
  return Math.round(Math.min(100, Math.max(0, ((now - debut) / denom) * 100)));
}

function daysBetween(from: string, to: string) {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  const diff = Math.ceil((b - a) / (1000 * 60 * 60 * 24));
  return diff;
}

const StatBadge = ({ statut }: { statut: Abonnement["statut"] }) => {
  const cls =
    statut === "actif"
      ? "bg-green-100 text-green-700"
      : statut === "en_attente"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  const label = statut === "en_attente" ? "En attente" : statut;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
};

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent: "green" | "red" | "blue";
}) {
  const left =
    accent === "green"
      ? "before:bg-green-500"
      : accent === "red"
        ? "before:bg-red-500"
        : "before:bg-blue-500";

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-4 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${left}`}
    >
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-1 text-2xl font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

/**
 * Card style “version 2”
 * - bandeau coloré
 * - infos en tuiles
 * - progression
 * - actions cohérentes (renouveler si expiré / demande)
 */
function AbonnementCardV2({
  a,
  onRenouveler,
}: {
  a: Abonnement;
  onRenouveler: (id: string) => void;
}) {
  const progress = getBillingProgress(a.dateDebut, a.dateFin);
  const joursRestants = daysBetween(new Date().toISOString(), a.dateFin);

  const isExpired = a.statut === "expiré";
  const isActive = a.statut === "actif";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Bandeau */}
      <div className="px-6 py-5 bg-linear-to-r from-sky-500 to-sky-400 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-extrabold truncate">{a.intituleOffre}</h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20">
                {a.statut === "en_attente" ? "En attente" : a.statut}
              </span>
            </div>
            <p className="text-white/85 text-sm mt-1 line-clamp-1">
              {a.description || "—"}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-3xl font-extrabold leading-none">
              {a.montant.toFixed(2)}
              <span className="text-base font-semibold ml-2">TND/{a.type === "annuel" ? "mois" : "mois"}</span>
            </div>
            <div className="text-white/80 text-sm mt-1">
              {a.type === "annuel" ? "Annuel" : "Mensuel"}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* Infos en tuiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Début</p>
            <p className="font-semibold text-gray-900">{formatDateFR(a.dateDebut)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              {isExpired ? "Terminé" : "Renouvellement"}
            </p>
            <p className="font-semibold text-gray-900">{formatDateFR(a.dateFin)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Tarif</p>
            <p className="font-semibold text-gray-900">
              {a.montant.toFixed(2)} TND/{a.type === "annuel" ? "an" : "mois"}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Période</p>
            <p className="font-semibold text-gray-900 capitalize">{a.type}</p>
          </div>
        </div>

        {/* Progression */}
        {isActive && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progression du cycle</span>
              <span className="font-semibold text-sky-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-sky-500 h-2.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>
                {joursRestants >= 0 ? `${joursRestants} jours restants` : "Échu"}
              </span>
              <span className="text-gray-400">
                Prochaine facturation : {formatDateFR(a.dateFin)}
              </span>
            </div>
          </div>
        )}

        {/* Actions renouvellement si expiré */}
        {isExpired && (
          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <StatBadge statut={a.statut} />
              {a.statutDemande === "en_attente" && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Demande en attente
                </span>
              )}
              {a.statutDemande === "acceptée" && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Demande acceptée
                </span>
              )}
              {a.statutDemande === "refusée" && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  Demande refusée
                </span>
              )}
            </div>

            {a.statutDemande !== "en_attente" && (
              <button
                onClick={() => onRenouveler(a.id)}
                className="px-4 py-2 rounded-xl border border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white text-sm font-semibold transition"
              >
                {a.statutDemande === "refusée" ? "Réessayer" : "Renouveler"}
              </button>
            )}
          </div>
        )}

        {/* Feedback */}
        <StarFeedback aboId={a.id} aDejaFeedback={a.aDejaFeedback} />
      </div>
    </div>
  );
}

export default function SubscriptionsSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAbonnements = async () => {
    const r = await axiosInstance.get("/abonnements");
    const data: Abonnement[] = r.data;

    const withStatut = await Promise.all(
      data.map(async (a) => {
        const [statutRes, feedbackRes] = await Promise.all([
          a.statut === "expiré"
            ? axiosInstance
                .get(`/demandes/${a.id}/statut`)
                .catch(() => ({ data: { statut: null } }))
            : Promise.resolve({ data: { statut: null } }),
          axiosInstance
            .get(`/feedbacks/${a.id}/exists`)
            .catch(() => ({ data: { exists: false } })),
        ]);

        return {
          ...a,
          statutDemande: a.statut === "expiré" ? statutRes.data.statut : null,
          aDejaFeedback: feedbackRes.data.exists,
        };
      }),
    );

    // Tri: plus récent (dateFin) -> plus ancien
    withStatut.sort(
      (x, y) => new Date(y.dateFin).getTime() - new Date(x.dateFin).getTime(),
    );

    setAbonnements(withStatut);
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      await loadAbonnements();
      if (active) setLoading(false);
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const renouveler = async (id: string) => {
    await axiosInstance.post(`/demandes/${id}/renouveler`);
    await loadAbonnements();
  };

  const actifs = useMemo(
    () => abonnements.filter((a) => a.statut === "actif"),
    [abonnements],
  );
  const expires = useMemo(
    () => abonnements.filter((a) => a.statut === "expiré"),
    [abonnements],
  );
  const enAttente = useMemo(
    () => abonnements.filter((a) => a.statut === "en_attente"),
    [abonnements],
  );

  // "Total payé" : logique simple et cohérente (ce qui est actuellement en cours)
  const totalPaye = useMemo(
    () => actifs.reduce((sum, a) => sum + (a.montant || 0), 0),
    [actifs],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-8 h-8 border-4 border-[#0F6CBD] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Abonnements</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gérez et suivez tous vos abonnements
        </p>
      </div>

      {/* KPI (comme la 2ème image) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Actifs" value={actifs.length} accent="green" />
        <KpiCard label="Expirés" value={expires.length} accent="red" />
        <KpiCard
          label="Total payé"
          value={`${totalPaye.toFixed(2)} TND`}
          accent="blue"
        />
      </div>

      {abonnements.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-75 text-center bg-white rounded-2xl border border-gray-200 p-10">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-sm font-medium">
            Aucun abonnement trouvé.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* ACTIFS */}
          <section>
            <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-3">
              Abonnements actifs
            </h2>

            {actifs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
                Aucun abonnement actif
              </div>
            ) : (
              <div className="space-y-4">
                {actifs.map((a) => (
                  <AbonnementCardV2 key={a.id} a={a} onRenouveler={renouveler} />
                ))}
              </div>
            )}
          </section>

          {/* EN ATTENTE (on garde logique, mais style propre) */}
          {enAttente.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-3">
                En attente
              </h2>
              <div className="space-y-4">
                {enAttente.map((a) => (
                  <AbonnementCardV2 key={a.id} a={a} onRenouveler={renouveler} />
                ))}
              </div>
            </section>
          )}

          {/* EXPIRES */}
          <section>
            <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-3">
              Abonnements expirés
            </h2>

            {expires.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-gray-400 text-xl">✉️</span>
                </div>
                <p className="text-gray-500">Aucun abonnement expiré</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expires.map((a) => (
                  <AbonnementCardV2 key={a.id} a={a} onRenouveler={renouveler} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}