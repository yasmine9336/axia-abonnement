import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

interface Abonnement {
  id: string;
  intituleOffre: string;
  description: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: "actif" | "suspendu" | "expiré";
  statutDemande?: string | null; // ← ajouté
}
const AbonnementCard = ({ a, progress, formatDate, renouveler }: {
  a: Abonnement;
  progress: number;
  formatDate: (d: string) => string;
  renouveler: (id: string) => void;
}) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900">{a.intituleOffre}</h2>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${a.statut === "actif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
          {a.statut}
        </span>
      </div>
      <div className="flex gap-2">
        {a.statut === "expiré" && (
          a.statutDemande === "en_attente" ? (
            <span className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-semibold">
              Demande en attente
            </span>
          ) : a.statutDemande === "acceptée" ? (
            <span className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-semibold">
              Demande acceptée
            </span>
          ) : a.statutDemande === "refusée" ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-semibold">
                Demande refusée
              </span>
              <button
                onClick={() => renouveler(a.id)}
                className="flex items-center gap-1.5 px-3 py-2 border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white rounded-xl text-xs font-semibold transition-all"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <button
              onClick={() => renouveler(a.id)}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white rounded-xl text-xs font-semibold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Renouveler
            </button>
          )
        )}
      </div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Début : {formatDate(a.dateDebut)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{a.statut === "expiré" ? "Terminé" : "Renouvellement"} : {formatDate(a.dateFin)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{a.montant} TND/{a.type === "annuel" ? "an" : "mois"}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="capitalize">{a.type}</span>
      </div>
    </div>

    {a.statut === "actif" && (
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progression du cycle</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-[#4F46E5] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Prochaine facturation : {formatDate(a.dateFin)}</p>
      </div>
    )}
  </div>
);

export default function SubscriptionsSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  const loadAbonnements = async () => {
    const r = await axiosInstance.get("/abonnements");
    const data: Abonnement[] = r.data;
    const withStatut = await Promise.all(
      data.map(async (a) => {
        if (a.statut === "expiré") {
          const res = await axiosInstance.get(`/demandes/${a.id}/statut`);
          return { ...a, statutDemande: res.data.statut };
        }
        return a;
      })
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

  const refresh = () => loadAbonnements();

  const renouveler = async (id: string) => {
    await axiosInstance.post(`/demandes/${id}/renouveler`);
    refresh();
  };

  const getBillingProgress = (dateDebut: string, dateFin: string) => {
    const debut = new Date(dateDebut).getTime();
    const fin = new Date(dateFin).getTime();
    const progress = Math.min(100, Math.max(0, ((now - debut) / (fin - debut)) * 100));
    return Math.round(progress);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR");

  if (loading) return (
    <div className="flex items-center justify-center min-h-100">
      <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes Abonnements</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez et suivez tous vos abonnements</p>
      </div>

      {abonnements.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-75 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Aucun abonnement trouvé.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Abonnements actifs */}
          {abonnements.filter(a => a.statut === "actif").length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Abonnements actifs</h2>
              <div className="space-y-4">
                {abonnements.filter(a => a.statut === "actif").map((a) => {
                  const progress = getBillingProgress(a.dateDebut, a.dateFin);
                  return <AbonnementCard key={a.id} a={a} progress={progress} formatDate={formatDate} renouveler={renouveler} />;
                })}
              </div>
            </div>
          )}

          {/* Historique */}
          {abonnements.filter(a => a.statut === "expiré").length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Historique</h2>
              <div className="space-y-4">
                {abonnements.filter(a => a.statut === "expiré").map((a) => {
                  const progress = getBillingProgress(a.dateDebut, a.dateFin);
                  return <AbonnementCard key={a.id} a={a} progress={progress} formatDate={formatDate} renouveler={renouveler} />;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}