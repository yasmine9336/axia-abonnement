import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, Power } from "lucide-react";

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

export default function AbonnementsSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAbonnements = () => {
    axiosInstance.get("/abonnements/all")
      .then(r => setAbonnements(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAbonnements();
  }, []);

  const handleActiver = async (id: string) => {
    await axiosInstance.patch(`/abonnements/${id}/activer`);
    fetchAbonnements();
  };

  const handleDesactiver = async (id: string) => {
    await axiosInstance.patch(`/abonnements/${id}/desactiver`);
    fetchAbonnements();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR");

  const filtered = abonnements.filter(a =>
    a.clientUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.intituleOffre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actifs = filtered.filter(a => a.statut === "actif");
  const desactives = filtered.filter(a => a.statut === "désactivé");
  const expires = filtered.filter(a => a.statut === "expiré");

  const AbonnementCard = ({ a }: { a: Abonnement }) => (
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

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            a.statut === "actif" ? "bg-green-100 text-green-700" :
            a.statut === "expiré" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {a.statut}
          </span>

          {a.statut === "actif" && (
            <button
              onClick={() => handleDesactiver(a.id)}
              title="Désactiver"
              className="p-2 rounded-xl border border-orange-200 text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Power size={15} />
            </button>
          )}
          {a.statut === "désactivé" && (
            <button
              onClick={() => handleActiver(a.id)}
              title="Activer"
              className="p-2 rounded-xl border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
            >
              <Power size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des abonnements</h1>
        <p className="text-gray-500 text-sm mt-1">
          {abonnements.filter(a => a.statut === "actif").length} actif(s) sur {abonnements.length} abonnement(s)
        </p>
      </div>

      {/* Search */}
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

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : abonnements.length === 0 ? (
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
                {actifs.map(a => <AbonnementCard key={a.id} a={a} />)}
              </div>
            </div>
          )}

          {desactives.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Désactivés</h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {desactives.length}
                </span>
              </div>
              <div className="space-y-3">
                {desactives.map(a => <AbonnementCard key={a.id} a={a} />)}
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
                {expires.map(a => <AbonnementCard key={a.id} a={a} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}