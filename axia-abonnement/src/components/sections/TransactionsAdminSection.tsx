import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search } from "lucide-react";
import ExportButton from "../common/ExportButton";
import { formatDateFR } from "../../utils/exportUtils";
import { useTheme } from "../../context/ThemeContext";

interface Paiement {
  id: string; montant: number; statut: string; createdAt: string;
  intituleOffre: string; typeAbonnement: string;
  clientUsername: string; clientEmail: string;
}

export default function TransactionsAdminSection() {
  const { accent } = useTheme();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axiosInstance.get("/payment/history/all")
      .then(r => setPaiements(r.data))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statutBadge = (statut: string) => {
    if (statut === "completed" || statut === "succeeded") return "bg-green-100 text-green-700";
    if (statut === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const filtered = paiements.filter(p =>
    p.clientUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.intituleOffre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">{paiements.length} transaction(s)</p>
      </div>

      <div className="flex justify-end mb-4">
        <ExportButton
          data={filtered}
          columns={[
            { key: "createdAt", label: "Date", format: v => formatDateFR(v) },
            { key: "clientUsername", label: "Client" },
            { key: "clientEmail", label: "Email" },
            { key: "intituleOffre", label: "Offre / Service" },
            { key: "typeAbonnement", label: "Type" },
            { key: "montant", label: "Montant (TND)" },
            { key: "statut", label: "Statut" },
          ]}
          filename="transactions" label="Exporter transactions"
          sheetName="Transactions" pdfTitle="Historique des transactions"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher par client, email ou offre..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}30`; }}
            onBlur={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: accent, borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Aucune transaction</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase" style={{ backgroundColor: `${accent}10` }}>
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
                  <td className="px-5 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{p.clientUsername}</p>
                    <p className="text-xs text-gray-400">{p.clientEmail}</p>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{p.intituleOffre}</td>
                  <td className="px-5 py-3 text-gray-500 capitalize">{p.typeAbonnement}</td>
                  <td className="px-5 py-3 text-gray-700 font-medium">{p.montant} TND</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statutBadge(p.statut)}`}>{p.statut}</span>
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
