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
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    const [d, a] = await Promise.all([
      axiosInstance.get("/demandes"),
      axiosInstance.get("/abonnements/all"),
    ]);
    setDemandes(d.data);
    setAbonnements(a.data);
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      await loadData();
      if (active) setLoading(false);
    };
    fetchData();
    return () => { active = false; };
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
  const acceptees = demandes.filter(d => d.statut === "acceptée");
  const refusees = demandes.filter(d => d.statut === "refusée");
  const demandesTraitees = demandes.filter(d => d.statut !== "en_attente");

  const statCards = [
    {
      label: "Total demandes",
      value: demandes.length,
      sub: "toutes confondues",
      color: "text-[#4F46E5]",
      bg: "bg-[#4F46E5]/10 text-[#4F46E5]",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "En attente",
      value: enAttente.length,
      sub: "à traiter",
      color: enAttente.length > 0 ? "text-yellow-600" : "text-gray-400",
      bg: enAttente.length > 0 ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Acceptées",
      value: acceptees.length,
      sub: "demandes traitées",
      color: "text-green-600",
      bg: "bg-green-100 text-green-700",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Refusées",
      value: refusees.length,
      sub: "demandes rejetées",
      color: refusees.length > 0 ? "text-red-600" : "text-gray-400",
      bg: refusees.length > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const historique: HistoriqueItem[] = [
    ...demandesTraitees.map(d => ({ kind: "demande" as const, data: d })),
    ...abonnements.map(a => ({ kind: "abonnement" as const, data: a })),
  ].sort((a, b) => {
    const dateA = a.kind === "demande" ? a.data.createdAt : a.data.dateDebut;
    const dateB = b.kind === "demande" ? b.data.createdAt : b.data.dateDebut;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const filteredHistorique = historique.filter(item =>
    item.data.clientUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.data.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.data.intituleOffre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suivi clients</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les demandes et consultez l'historique des clients.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* En attente */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Demandes de renouvellement</h2>
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
              <div key={d.id} className="rounded-2xl border border-yellow-200 bg-yellow-50/30 p-5">
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

      {/* Historique */}
      {historique.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Historique</h2>

          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par client, email ou offre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistorique.map((item, i) => (
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.data.statut === "acceptée" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {item.data.statut}
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.data.statut === "actif" ? "bg-green-100 text-green-700" :
                        item.data.statut === "expiré" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {item.data.statut}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.kind === "demande" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
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
