import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

interface Demande {
  id: string;
  abonnementId: string;
  clientUsername: string;
  clientEmail: string;
  intituleOffre: string;
  type: string;
  montant: number;
  statut: string;
  createdAt: string;
}

interface Abonnement {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateDebut: string;
  statut: string;
  clientUsername: string;
  clientEmail: string;
}

type HistoriqueItem =
  | { kind: "demande"; data: Demande }
  | { kind: "abonnement"; data: Abonnement };

export default function DemandesSection() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const loadData = async () => {
    const [d, a] = await Promise.all([
      axiosInstance.get("/demandes"),
      axiosInstance.get("/abonnements/all"),
    ]);
    setDemandes(d.data);
    setAbonnements(a.data);
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const refresh = () => loadData();

  const accepter = async (id: string) => {
    await axiosInstance.patch(`/demandes/${id}/accepter`);
    refresh();
  };

  const refuser = async (id: string) => {
    await axiosInstance.patch(`/demandes/${id}/refuser`);
    refresh();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR");

  if (loading) return (
    <div className="flex items-center justify-center min-h-100">
      <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const enAttente = demandes.filter(d => d.statut === "en_attente");
  const demandesTraitees = demandes.filter(d => d.statut !== "en_attente");

  // Historique combiné : demandes traitées + nouveaux abonnements
  const historique: HistoriqueItem[] = [
    ...demandesTraitees.map(d => ({ kind: "demande" as const, data: d })),
    ...abonnements.map(a => ({ kind: "abonnement" as const, data: a })),
  ].sort((a, b) => {
    const dateA = a.kind === "demande" ? a.data.createdAt : a.data.dateDebut;
    const dateB = b.kind === "demande" ? b.data.createdAt : b.data.dateDebut;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Demandes de renouvellement</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les demandes et consultez l'historique des clients.</p>
      </div>

      {/* En attente */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-700">En attente</h2>
          {enAttente.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {enAttente.length}
            </span>
          )}
        </div>

        {enAttente.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            Aucune demande en attente
          </div>
        ) : (
          <div className="space-y-3">
            {enAttente.map(d => (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{d.clientUsername}</p>
                      <span className="text-xs text-gray-400">{d.clientEmail}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Offre : <span className="font-medium text-gray-900">{d.intituleOffre}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Type : <span className="capitalize font-medium">{d.type}</span>
                      {" · "}
                      Montant : <span className="font-medium">{d.montant} TND</span>
                    </p>
                    <p className="text-xs text-gray-400">Envoyée le {formatDate(d.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => accepter(d.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Accepter
                    </button>
                    <button
                      onClick={() => refuser(d.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique combiné */}
      {historique.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Historique</h2>
          <div className="space-y-3">
            {historique.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{item.data.clientUsername}</p>
                      <span className="text-xs text-gray-400">{item.data.clientEmail}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Offre : <span className="font-medium text-gray-900">{item.data.intituleOffre}</span>
                      {" · "}
                      <span className="capitalize">{item.data.type}</span>
                      {" · "}
                      {item.data.montant} TND
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.kind === "demande"
                        ? `Demande de renouvellement — ${formatDate(item.data.createdAt)}`
                        : `Nouvel abonnement — ${formatDate(item.data.dateDebut)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {item.kind === "demande" ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.data.statut === "acceptée"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                        {item.data.statut}
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.data.statut === "actif" ? "bg-green-100 text-green-700" :
                          item.data.statut === "expiré" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-600"
                        }`}>
                        {item.data.statut}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.kind === "demande"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                      }`}>
                      {item.kind === "demande" ? "Renouvellement" : "Nouvel abonnement"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}