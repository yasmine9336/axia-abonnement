import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { PackageCheck } from "lucide-react";

interface Abonnement {
  id: string;
  intituleOffre: string;
  description: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: "actif" | "en_attente" | "expiré";
  statutDemande?: string | null;
  noteFeedback?: number | null;
  peutRenouveler?: boolean;
}

function StarFeedback({
  aboId,
  noteFeedback,
}: {
  aboId: string;
  noteFeedback?: number | null;
}) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(noteFeedback ?? 0);

  const alreadySent = selected > 0;

  const handleClick = async (n: number) => {
    if (alreadySent) return;
    await axiosInstance.post("/feedbacks", { abonnementId: aboId, note: n });
    setSelected(n);
  };

  const label = alreadySent
    ? noteFeedback
      ? "Déjà noté"
      : "Merci pour votre avis"
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
              onClick={() => void handleClick(i)}
              onMouseEnter={() => !alreadySent && setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="disabled:cursor-default"
              aria-label={`Noter ${i} étoiles`}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  i <= (hover || selected) ? "text-yellow-400" : "text-gray-200"
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
  const border =
    accent === "green"
      ? "border-t-green-500"
      : accent === "red"
        ? "border-t-red-500"
        : "border-t-blue-500";

  const icon =
    accent === "green" ? (
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 block" />
      </div>
    ) : accent === "red" ? (
      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
      </div>
    ) : (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "var(--color-primary-soft)" }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full block"
          style={{ background: "var(--color-primary)" }}
        />
      </div>
    );

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${border} p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium tracking-wide mb-2 uppercase">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="mt-1">{icon}</div>
      </div>
    </div>
  );
}

function AbonnementCardV2({
  a,
  onRenouveler,
  onPayer,
}: {
  a: Abonnement;
  onRenouveler: (id: string) => void;
  onPayer: (id: string) => void;
}) {
  const progress = getBillingProgress(a.dateDebut, a.dateFin);
  const joursRestants = daysBetween(new Date().toISOString(), a.dateFin);

  const isExpired = a.statut === "expiré";
  const isActive = a.statut === "actif";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Bandeau */}
      <div
        className="px-6 py-5 text-white"
        style={{ background: "var(--color-primary)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-extrabold truncate">
                {a.intituleOffre}
              </h3>
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
              <span className="text-base font-semibold ml-2">
                TND/{a.type === "annuel" ? "an" : "mois"}
              </span>
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
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Début
            </p>
            <p className="font-semibold text-gray-900">
              {formatDateFR(a.dateDebut)}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              {isExpired ? "Terminé" : "Renouvellement"}
            </p>
            <p className="font-semibold text-gray-900">
              {formatDateFR(a.dateFin)}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Tarif
            </p>
            <p className="font-semibold text-gray-900">
              {a.montant.toFixed(2)} TND/{a.type === "annuel" ? "an" : "mois"}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Période
            </p>
            <p className="font-semibold text-gray-900 capitalize">{a.type}</p>
          </div>
        </div>

        {/* Progression */}
        {isActive && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progression du cycle</span>
              <span
                className="font-semibold"
                style={{ color: "var(--color-primary)" }}
              >
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: "var(--color-primary)",
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>
                {joursRestants >= 0
                  ? `${joursRestants} jours restants`
                  : "Échu"}
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
            <div className="flex items-center gap-2 flex-wrap">
              <StatBadge statut={a.statut} />

              {!a.peutRenouveler && (
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                  Service non disponible
                </span>
              )}

              {a.peutRenouveler && a.statutDemande === "en_attente" && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Demande en attente
                </span>
              )}
              {a.peutRenouveler && a.statutDemande === "acceptée" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  Paiement requis
                </span>
              )}
              {a.peutRenouveler && a.statutDemande === "refusée" && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  Demande refusée
                </span>
              )}
              {a.peutRenouveler && a.statutDemande === "expirée" && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  Délai de paiement expiré
                </span>
              )}
            </div>

            {a.peutRenouveler && a.statutDemande === "acceptée" && (
              <button
                onClick={() => onPayer(a.id)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--color-primary)" }}
              >
                Payer
              </button>
            )}

            {a.peutRenouveler &&
              a.statutDemande !== "en_attente" &&
              a.statutDemande !== "acceptée" && (
                <button
                  onClick={() => onRenouveler(a.id)}
                  className="px-4 py-2 rounded-xl border text-sm font-semibold transition hover:text-white"
                  style={{
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {a.statutDemande === "refusée" ||
                  a.statutDemande === "expirée"
                    ? "Réessayer"
                    : "Renouveler"}
                </button>
              )}
          </div>
        )}

        {/* Feedback */}
        <StarFeedback aboId={a.id} noteFeedback={a.noteFeedback} />
      </div>
    </div>
  );
}

export default function SubscriptionsSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAbonnements = async () => {
    try {
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
              .get(`/feedbacks/${a.id}/my-note`)
              .catch(() => ({ data: { note: null } })),
          ]);

          return {
            ...a,
            statutDemande: a.statut === "expiré" ? statutRes.data.statut : null,
            noteFeedback: feedbackRes.data.note ?? null,
          };
        }),
      );

      withStatut.sort(
        (x, y) => new Date(y.dateFin).getTime() - new Date(x.dateFin).getTime(),
      );

      setAbonnements(withStatut);
    } catch {
      setAbonnements([]);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      await loadAbonnements();
      if (active) setLoading(false);
    };
    void fetchData();
    return () => {
      active = false;
    };
  }, []);

  const renouveler = async (id: string) => {
    await axiosInstance.post(`/demandes/${id}/renouveler`);
    await loadAbonnements();
  };

  const payer = async (id: string) => {
    const r = await axiosInstance.post("/payment/create-renewal-session", {
      abonnementId: id,
    });
    window.location.href = r.data.url;
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

  const totalPaye = useMemo(
    () => actifs.reduce((sum, a) => sum + (a.montant || 0), 0),
    [actifs],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="ui-spinner" />
      </div>
    );
  }

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Mes Abonnements</h1>
        <p className="ui-subtitle">Gérez et suivez tous vos abonnements</p>
      </div>

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
                  <AbonnementCardV2
                    key={a.id}
                    a={a}
                    onRenouveler={renouveler}
                    onPayer={payer}
                  />
                ))}
              </div>
            )}
          </section>

          {enAttente.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-3">
                En attente
              </h2>
              <div className="space-y-4">
                {enAttente.map((a) => (
                  <AbonnementCardV2
                    key={a.id}
                    a={a}
                    onRenouveler={renouveler}
                    onPayer={payer}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-3">
              Abonnements expirés
            </h2>
            {expires.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div
                  className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "var(--color-primary-soft)" }}
                >
                  <PackageCheck
                    className="w-6 h-6"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <p className="text-gray-500">Aucun abonnement expiré</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expires.map((a) => (
                  <AbonnementCardV2
                    key={a.id}
                    a={a}
                    onRenouveler={renouveler}
                    onPayer={payer}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
