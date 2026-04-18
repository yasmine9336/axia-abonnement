import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";

interface Paiement {
  id: string; montant: number; statut: string;
  createdAt: string; intituleOffre: string; typeAbonnement: string;
}

const isCompleted = (s: string) => s === "completed" || s === "succeeded";
const formatStatut = (s: string) => isCompleted(s) ? "Complété" : s === "pending" ? "En cours" : "Échoué";
const statutBadge = (s: string) => isCompleted(s) ? "bg-green-100 text-green-700" : s === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";

export default function HistoriqueSection() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance.get("/payment/history")
      .then(r => setPaiements(r.data))
      .catch(() => setError("Erreur lors du chargement des transactions."))
      .finally(() => setLoading(false));
  }, []);

  const totalDepense = useMemo(() => paiements.filter(p => isCompleted(p.statut)).reduce((s, p) => s + p.montant, 0), [paiements]);
  const ceMois = useMemo(() => {
    const now = new Date();
    return paiements.filter(p => isCompleted(p.statut) && (() => { const d = new Date(p.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })()).reduce((s, p) => s + p.montant, 0);
  }, [paiements]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historique des transactions</h1>
        <p className="text-gray-500 text-sm mt-1">{paiements.length} transaction(s)</p>
      </div>

      {/* KPI Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total dépensé</p>
              <p className="text-xl font-bold text-gray-900">{totalDepense.toFixed(2)} TND</p>
              <p className="text-xs text-gray-400">paiements complétés</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-xl font-bold text-gray-900">{paiements.length}</p>
              <p className="text-xs text-gray-400">{paiements.filter(p => isCompleted(p.statut)).length} complétées</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ce mois-ci</p>
              <p className="text-xl font-bold text-gray-900">{ceMois.toFixed(2)} TND</p>
              <p className="text-xs text-gray-400">dépensé ce mois</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : paiements.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Aucune transaction</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {paiements.map(p => (
            <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isCompleted(p.statut) ? "bg-green-100" : p.statut === "pending" ? "bg-yellow-100" : "bg-red-100"}`}>
                  {isCompleted(p.statut)
                    ? <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    : p.statut === "pending"
                    ? <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    : <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.intituleOffre}</p>
                  <p className="text-xs text-gray-400">{formatDate(p.createdAt)} · <span className="capitalize">{p.typeAbonnement}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statutBadge(p.statut)}`}>{formatStatut(p.statut)}</span>
                <p className="text-sm font-bold text-gray-900 min-w-20 text-right">{p.montant} TND</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
