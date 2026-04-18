import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search } from "lucide-react";
import ExportButton from "../common/ExportButton";
import { formatDateFR } from "../../utils/exportUtils";

interface Abonnement {
  id: string;
  intituleOffre: string;
  description: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: string;
  clientUsername: string;
  clientEmail: string;
}

interface Demande {
  id: string;
  abonnementId: string;
  statut: string;
}

export default function AbonnementsAdminSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [abosRes, demandesRes] = await Promise.all([
          axiosInstance.get<Abonnement[]>("/abonnements/all"),
          axiosInstance.get<Demande[]>("/demandes"),
        ]);
        setAbonnements(abosRes.data ?? []);
        setDemandes(demandesRes.data ?? []);
      } catch {
        setError("Erreur lors du chargement des abonnements.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR");

  const filtered = abonnements.filter(
    (a) =>
      a.clientUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.intituleOffre?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const demandesEnAttenteIds = new Set(
    demandes.filter((d) => d.statut === "en_attente").map((d) => d.abonnementId),
  );

  const actifs = filtered.filter(
    (a) => a.statut === "actif" && !demandesEnAttenteIds.has(a.id),
  );
  const enDemandeRenouvellement = filtered.filter((a) =>
    demandesEnAttenteIds.has(a.id),
  );
  const expires = filtered.filter((a) => a.statut === "expiré");

  const totalActifs = abonnements.filter(
    (a) => a.statut === "actif" && !demandesEnAttenteIds.has(a.id),
  ).length;
  const totalEnDemande = abonnements.filter((a) =>
    demandesEnAttenteIds.has(a.id),
  ).length;
  const totalExpires = abonnements.filter((a) => a.statut === "expiré").length;

  const statCards = [
    {
      label: "Total abonnements",
      value: abonnements.length,
      sub: "tous statuts confondus",
      color: "text-[#4F46E5]",
      bg: "bg-[#4F46E5]/10 text-[#4F46E5]",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
        </svg>
      ),
    },
    {
      label: "Actifs",
      value: totalActifs,
      sub: "abonnements en cours",
      color: "text-green-600",
      bg: "bg-green-100 text-green-700",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "En renouvellement",
      value: totalEnDemande,
      sub: "demandes en attente",
      color: totalEnDemande > 0 ? "text-amber-600" : "text-gray-400",
      bg: totalEnDemande > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Expirés",
      value: totalExpires,
      sub: "à renouveler",
      color: totalExpires > 0 ? "text-red-600" : "text-gray-400",
      bg: totalExpires > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  const AbonnementCard = ({
    a,
    badgeLabel,
    badgeClass,
  }: {
    a: Abonnement;
    badgeLabel: string;
    badgeClass: string;
  }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{a.clientUsername}</p>
            <span className="text-xs text-gray-400">{a.clientEmail}</span>
          </div>
          <p className="text-sm text-gray-600">
            Offre : <span className="font-medium text-gray-900">{a.intituleOffre}</span>
          </p>
          <p className="text-sm text-gray-600">
            Type : <span className="capitalize font-medium">{a.type}</span>
            {" · "}
            Montant : <span className="font-medium">{a.montant} TND</span>
          </p>
          <p className="text-xs text-gray-400">
            Du {formatDate(a.dateDebut)} au {formatDate(a.dateFin)}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalActifs} actif(s) · {totalEnDemande} en demande de renouvellement · {totalExpires} expiré(s)
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <div className="flex justify-end mb-4">
        <ExportButton
          data={filtered}
          columns={[
            { key: "clientUsername", label: "Client" },
            { key: "clientEmail", label: "Email" },
            { key: "intituleOffre", label: "Offre / Service" },
            { key: "type", label: "Type" },
            { key: "montant", label: "Montant (TND)" },
            { key: "dateDebut", label: "Date début", format: (v) => formatDateFR(v) },
            { key: "dateFin", label: "Date fin", format: (v) => formatDateFR(v) },
            { key: "statut", label: "Statut" },
          ]}
          filename="abonnements"
          label="Exporter abonnements"
          sheetName="Abonnements"
          pdfTitle="Liste des abonnements"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher par client, email ou offre..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucun abonnement trouvé
        </div>
      ) : (
        <div className="space-y-8">
          {actifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Actifs</h2>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {actifs.length}
                </span>
              </div>
              <div className="space-y-3">
                {actifs.map((a) => (
                  <AbonnementCard key={a.id} a={a} badgeLabel="actif" badgeClass="bg-green-100 text-green-700" />
                ))}
              </div>
            </div>
          )}

          {enDemandeRenouvellement.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">En demande de renouvellement</h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {enDemandeRenouvellement.length}
                </span>
              </div>
              <div className="space-y-3">
                {enDemandeRenouvellement.map((a) => (
                  <AbonnementCard key={a.id} a={a} badgeLabel="en attente" badgeClass="bg-amber-100 text-amber-700" />
                ))}
              </div>
            </div>
          )}

          {expires.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Expirés</h2>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {expires.length}
                </span>
              </div>
              <div className="space-y-3">
                {expires.map((a) => (
                  <AbonnementCard key={a.id} a={a} badgeLabel="expiré" badgeClass="bg-red-100 text-red-700" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
