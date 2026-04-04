import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search } from "lucide-react";

interface Abonnement {
  id: string;
  intituleOffre: string;
  description: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: string; // "actif" | "désactivé" | "expiré"
  clientUsername: string;
  clientEmail: string;
}

interface Demande {
  id: string;
  abonnementId: string;
  statut: string; // "en_attente" | "acceptee" | "refusee"
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

  const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR");

  const filtered = abonnements.filter(
    (a) =>
      a.clientUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.intituleOffre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const demandesEnAttenteIds = new Set(
    demandes
      .filter((d) => d.statut === "en_attente")
      .map((d) => d.abonnementId)
  );

  const actifs = filtered.filter(
    (a) => a.statut === "actif" && !demandesEnAttenteIds.has(a.id)
  );

  const enDemandeRenouvellement = filtered.filter((a) =>
    demandesEnAttenteIds.has(a.id)
  );

  const expires = filtered.filter((a) => a.statut === "expiré");

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
        <p className="text-gray-500 text-sm mt-1">
          {actifs.length} actif(s) · {enDemandeRenouvellement.length} en demande de
          renouvellement · {expires.length} expiré(s)
        </p>
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
        <div className="text-center py-16 text-gray-400 text-sm">Aucun abonnement trouvé</div>
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
                  <AbonnementCard
                    key={a.id}
                    a={a}
                    badgeLabel="actif"
                    badgeClass="bg-green-100 text-green-700"
                  />
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
                  <AbonnementCard
                    key={a.id}
                    a={a}
                    badgeLabel="en attente"
                    badgeClass="bg-amber-100 text-amber-700"
                  />
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
                  <AbonnementCard
                    key={a.id}
                    a={a}
                    badgeLabel="expiré"
                    badgeClass="bg-red-100 text-red-700"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}