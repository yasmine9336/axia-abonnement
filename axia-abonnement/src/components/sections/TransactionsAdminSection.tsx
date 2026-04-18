import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search } from "lucide-react";
import ExportButton from "./../common/ExportButton";
import { formatDateFR } from "../../utils/exportUtils";

interface Paiement {
  id: string; montant: number; statut: string; createdAt: string;
  intituleOffre: string; typeAbonnement: string;
  clientUsername: string; clientEmail: string;
}

const isCompleted = (s: string) => s === "completed" || s === "succeeded";

export default function TransactionsAdminSection() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axiosInstance.get("/payment/history/all")
      .then(r => setPaiements(r.data))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenu = useMemo(() => paiements.filter(p => isCompleted(p.statut)).reduce((s, p) => s + p.montant, 0), [paiements]);
  const nbCompletes = useMemo(() => paiements.filter(p => isCompleted(p.statut)).length, [paiements]);
  const nbEnAttente = useMemo(() => paiements.filter(p => p.statut === "pending").length, [paiements]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statutLabel = (s: string) => isCompleted(s) ? "Complété" : s === "pending" ? "En cours" : "Échoué";
  const statutBadge = (s: string) => isCompleted(s) ? "bg-green-100 text-green-700" : s === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
  const statutIcon = (s: string) => isCompleted(s)
    ? <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    : s === "pending"
    ? <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    : <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

  const filtered = paiements.filter(p =>
    p.clientUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.intituleOffre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">{paiements.length} transaction(s)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {loading ? [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 h-20 animate-pulse" />) : <>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenu total</p>
              <p className="text-xl font-bold text-gray-900">{totalRevenu.toFixed(2)} TND</p>
              <p className="text-xs text-gray-400">{nbCompletes} paiements complétés</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total transactions</p>
              <p className="text-xl font-bold text-gray-900">{paiements.length}</p>
              <p className="text-xs text-gray-400">toutes périodes</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${nbEnAttente > 0 ? "bg-yellow-100" : "bg-gray-100"} rounded-xl flex items-center justify-center shrink-0`}>
              <svg className={`w-5 h-5 ${nbEnAttente > 0 ? "text-yellow-600" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">En attente</p>
              <p className="text-xl font-bold text-gray-900">{nbEnAttente}</p>
              <p className="text-xs text-gray-400">à traiter</p>
            </div>
          </div>
        </>}
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Rechercher par client, email ou offre..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <ExportButton data={filtered}
          columns={[
            { key: "createdAt", label: "Date", format: v => formatDateFR(v) },
            { key: "clientUsername", label: "Client" },
            { key: "clientEmail", label: "Email" },
            { key: "intituleOffre", label: "Offre / Service" },
            { key: "typeAbonnement", label: "Type" },
            { key: "montant", label: "Montant (TND)" },
            { key: "statut", label: "Statut" },
          ]}
          filename="transactions" label="Exporter" sheetName="Transactions" pdfTitle="Historique des transactions"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Aucune transaction</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Offre / Service</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Montant</th>
                <th className="px-5 py-3 font-medium text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{p.clientUsername}</p>
                    <p className="text-xs text-gray-400">{p.clientEmail}</p>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{p.intituleOffre}</td>
                  <td className="px-5 py-3 text-gray-500 capitalize">{p.typeAbonnement}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{p.montant} TND</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted(p.statut) ? "bg-green-100" : p.statut === "pending" ? "bg-yellow-100" : "bg-red-100"}`}>
                        {statutIcon(p.statut)}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statutBadge(p.statut)}`}>
                        {statutLabel(p.statut)}
                      </span>
                    </div>
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
