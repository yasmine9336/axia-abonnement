import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

interface Paiement {
  id: string;
  montant: number;
  statut: string;
  createdAt: string;
  intituleOffre: string;
  typeAbonnement: string;
}

// ✅ Fonction de traduction des statuts
const formatStatut = (statut: string): string => {
  if (statut === "completed" || statut === "succeeded") return "Complété";
  if (statut === "pending") return "En cours";
  return "Échoué";
};

const statutBadge = (statut: string): string => {
  if (statut === "completed" || statut === "succeeded")
    return "bg-green-100 text-green-700";
  if (statut === "pending") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

export default function HistoriqueSection() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  // ✅ Gestion d'erreur
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/payment/history")
      .then((r) => setPaiements(r.data))
      .catch(() => setError("Erreur lors du chargement des transactions."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Historique des transactions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {paiements.length} transaction(s)
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : paiements.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucune transaction
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Offre / Service</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Montant</th>
                <th className="px-5 py-3 font-medium text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paiements.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {p.intituleOffre}
                  </td>
                  <td className="px-5 py-3 text-gray-500 capitalize">
                    {p.typeAbonnement}
                  </td>
                  <td className="px-5 py-3 text-gray-700 font-medium">
                    {p.montant} TND
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statutBadge(p.statut)}`}>
                      {/* ✅ Statut traduit */}
                      {formatStatut(p.statut)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}